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
