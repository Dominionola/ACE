"use server";

import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { InsertCardSchema, InsertCard } from "@/lib/schemas/deck";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Schema for the AI response
const FlashcardResponseSchema = z.object({
    cards: z.array(
        z.object({
            front_content: z.string(),
            back_content: z.string(),
        })
    ),
});

export async function generateFlashcards(documentId: string, deckId: string) {
    const supabase = await createClient();

    // 1. Auth Check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Rate Limit Check
    const { checkRateLimit, AI_RATE_LIMIT } = await import("@/lib/rate-limit");
    const rateCheck = checkRateLimit(`flashcards:${user.id}`, AI_RATE_LIMIT);
    if (!rateCheck.success) {
        return { success: false, error: `Rate limit exceeded. Try again in ${Math.ceil(rateCheck.resetIn / 60000)} minutes.` };
    }

    // 2. Fetch Document
    const { data: document, error: docError } = await supabase
        .from("documents")
        .select("extracted_text")
        .eq("id", documentId)
        .single();

    if (docError || !document || !document.extracted_text) {
        return { success: false, error: "Document not found or empty." };
    }

    // 3. Generate Cards with AI
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: FlashcardResponseSchema,
            prompt: `You are an expert tutor. Create 10 high-quality flashcards based on the following text.
          
          Requirements:
          - 'front_content': A clear concept, term, or question.
          - 'back_content': A concise definition or answer (max 30 words).
          - Focus on the most important concepts for studying.
          
          Text:
          ${document.extracted_text.slice(0, 30000)}`,
        });

        // 4. Prepare and Insert Cards
        const cardsToInsert: InsertCard[] = object.cards.map((card) => ({
            deck_id: deckId,
            front_content: card.front_content,
            back_content: card.back_content,
            difficulty_rating: 3, // Default
        }));

        // Validate with Schema (optional but good practice)
        // We skip individual validation loop for speed, assuming AI adheres to schema mostly.

        const { error: insertError } = await supabase
            .from("cards")
            .insert(cardsToInsert);

        if (insertError) {
            console.error("Card insert error:", insertError);
            return { success: false, error: "Failed to save cards." };
        }

        revalidatePath(`/dashboard/decks/${deckId}`);
        return { success: true, count: cardsToInsert.length };

    } catch (error) {
        console.error("Flashcard generation error:", error);
        return { success: false, error: "Failed to generate flashcards." };
    }
}

const SuperMemo2 = (quality: number, lastInterval: number, lastRepetitions: number, lastEaseFactor: number) => {
    let interval: number;
    let repetitions: number;
    let easeFactor: number;

    if (quality >= 3) {
        if (lastRepetitions === 0) {
            interval = 1;
        } else if (lastRepetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(lastInterval * lastEaseFactor);
        }
        repetitions = lastRepetitions + 1;
    } else {
        repetitions = 0;
        interval = 1;
    }

    easeFactor = lastEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    return { interval, repetitions, easeFactor };
};

// ============================================
// Manual Card Creation
// ============================================

export async function createCard(
    deckId: string,
    front: string,
    back: string
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const validation = InsertCardSchema.safeParse({
        deck_id: deckId,
        front_content: front,
        back_content: back,
        difficulty_rating: 3,
    });

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { error } = await supabase.from("cards").insert({
        ...validation.data,
        // Initialize SM-2 values
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review: new Date().toISOString(), // Due immediately
    });

    if (error) {
        console.error("Create card error:", error);
        return { success: false, error: "Failed to create card" };
    }

    revalidatePath(`/dashboard/decks/${deckId}`);
    return { success: true };
}

// ============================================
// Update Card Progress (SM-2)
// ============================================

export async function updateCardProgress(
    cardId: string,
    quality: number // 0-5 rating
) {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Fetch current card stats
    const { data: card, error: fetchError } = await supabase
        .from("cards")
        .select("ease_factor, interval, repetitions, deck_id")
        .eq("id", cardId)
        .single();

    if (fetchError || !card) {
        return { success: false, error: "Card not found" };
    }

    // Calculate new stats using SM-2
    const { interval, repetitions, easeFactor } = SuperMemo2(
        quality,
        card.interval || 0,
        card.repetitions || 0,
        card.ease_factor || 2.5
    );

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    // Update DB
    const { error: updateError } = await supabase
        .from("cards")
        .update({
            interval,
            repetitions,
            ease_factor: easeFactor,
            next_review: nextReview.toISOString(),
            last_reviewed: new Date().toISOString(),
        })
        .eq("id", cardId);

    if (updateError) {
        console.error("Update card progress error:", updateError);
        return { success: false, error: "Failed to update progress" };
    }

    revalidatePath(`/dashboard/decks/${card.deck_id}`);
    revalidatePath(`/dashboard/flashcards`);
    return { success: true };
}

// ============================================
// Delete Card
// ============================================

export async function deleteCard(cardId: string, deckId: string) {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", cardId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/decks/${deckId}`);
    return { success: true };
}
