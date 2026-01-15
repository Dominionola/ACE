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

    // 2. Verify Ownership BEFORE rate limiting
    // Check that both the deck and document belong to this user
    const { data: deck, error: deckError } = await supabase
        .from("decks")
        .select("id")
        .eq("id", deckId)
        .eq("user_id", user.id)
        .single();

    if (deckError || !deck) {
        return { success: false, error: "Deck not found or access denied" };
    }

    const { data: document, error: docError } = await supabase
        .from("documents")
        .select("extracted_text, deck_id")
        .eq("id", documentId)
        .single();

    if (docError || !document || !document.extracted_text) {
        return { success: false, error: "Document not found or empty." };
    }

    // Verify document belongs to the user's deck
    if (document.deck_id !== deckId) {
        return { success: false, error: "Document does not belong to this deck." };
    }

    // 3. Rate Limit Check (only after ownership is confirmed)
    const { checkRateLimit, AI_RATE_LIMIT } = await import("@/lib/rate-limit");
    const rateCheck = checkRateLimit(`flashcards:${user.id}`, AI_RATE_LIMIT);
    if (!rateCheck.success) {
        return { success: false, error: `Rate limit exceeded. Try again in ${Math.ceil(rateCheck.resetIn / 60000)} minutes.` };
    }

    // 4. Generate Cards with AI
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

        // 5. Prepare and Insert Cards
        const cardsToInsert: InsertCard[] = object.cards.map((card) => ({
            deck_id: deckId,
            front_content: card.front_content,
            back_content: card.back_content,
            difficulty_rating: 3, // Default
        }));

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

import { AdaptiveEngine, ReviewItem } from "@/lib/learning/adaptive-engine";

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

    // Fetch current card stats with ownership verification
    const { data: card, error: fetchError } = await supabase
        .from("cards")
        .select(`
            id,
            ease_factor, 
            interval, 
            repetitions, 
            deck_id,
            last_reviewed,
            next_review,
            decks!inner(user_id)
        `)
        .eq("id", cardId)
        .eq("decks.user_id", user.id)
        .single();

    if (fetchError || !card) {
        return { success: false, error: "Card not found or access denied" };
    }

    // Map to ReviewItem
    const reviewItem: ReviewItem = {
        id: card.id,
        topic: "general",
        level: "intermediate",
        lastReview: new Date(card.last_reviewed || Date.now()),
        nextReview: new Date(card.next_review || Date.now()),
        interval: card.interval || 0,
        easeFactor: card.ease_factor || 2.5,
        reviewCount: card.repetitions || 0,
    };

    // Calculate new stats using AdaptiveEngine
    const updatedItem = AdaptiveEngine.scheduleNextReview(reviewItem, quality);

    // Update DB
    const { error: updateError } = await supabase
        .from("cards")
        .update({
            interval: updatedItem.interval,
            repetitions: updatedItem.reviewCount,
            ease_factor: updatedItem.easeFactor,
            next_review: updatedItem.nextReview.toISOString(),
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

    // Verify ownership before deletion
    const { data: card, error: fetchError } = await supabase
        .from("cards")
        .select(`
            id,
            decks!inner(user_id)
        `)
        .eq("id", cardId)
        .eq("decks.user_id", user.id)
        .single();

    if (fetchError || !card) {
        return { success: false, error: "Card not found or access denied" };
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

// ============================================
// Get Due Cards Count
// ============================================

export async function getDueCardsCount(): Promise<{ total: number; byDeck: { deckId: string; deckTitle: string; count: number }[] }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { total: 0, byDeck: [] };
    }

    // Get all user's decks with their cards
    const { data: decks, error } = await supabase
        .from("decks")
        .select(`
            id,
            title,
            cards (
                id,
                next_review
            )
        `)
        .eq("user_id", user.id);

    if (error || !decks) {
        console.error("Error fetching due cards:", error);
        return { total: 0, byDeck: [] };
    }

    const now = new Date();
    let total = 0;
    const byDeck: { deckId: string; deckTitle: string; count: number }[] = [];

    for (const deck of decks) {
        const dueCards = (deck.cards || []).filter((card: { next_review: string | null }) => {
            if (!card.next_review) return true; // New cards are due
            return new Date(card.next_review) <= now;
        });

        if (dueCards.length > 0) {
            byDeck.push({
                deckId: deck.id,
                deckTitle: deck.title,
                count: dueCards.length,
            });
            total += dueCards.length;
        }
    }

    return { total, byDeck };
}

// ============================================
// Card Tag Management
// ============================================

export async function updateCardTag(cardId: string, tag: string | null) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const { data: card, error: fetchError } = await supabase
        .from("cards")
        .select(`id, deck_id, decks!inner(user_id)`)
        .eq("id", cardId)
        .eq("decks.user_id", user.id)
        .single();

    if (fetchError || !card) {
        return { success: false, error: "Card not found or access denied" };
    }

    const { error } = await supabase
        .from("cards")
        .update({ tag: tag || null })
        .eq("id", cardId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/decks/${card.deck_id}`);
    return { success: true };
}

export async function getCardTagsForDeck(deckId: string): Promise<string[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get unique tags used in this deck's cards
    const { data: cards, error } = await supabase
        .from("cards")
        .select("tag")
        .eq("deck_id", deckId)
        .not("tag", "is", null);

    if (error || !cards) return [];

    // Extract unique tags
    const tags = [...new Set(cards.map(c => c.tag).filter(Boolean))] as string[];
    return tags.sort();
}

export async function getCardsGroupedByTag(deckId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, groups: [] };
    }

    // Verify deck ownership
    const { data: deck, error: deckError } = await supabase
        .from("decks")
        .select("id")
        .eq("id", deckId)
        .eq("user_id", user.id)
        .single();

    if (deckError || !deck) {
        return { success: false, groups: [], error: "Deck not found" };
    }

    // Get all cards for this deck
    const { data: cards, error } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: true });

    if (error || !cards) {
        return { success: false, groups: [], error: "Failed to fetch cards" };
    }

    // Group cards by tag
    const grouped: Record<string, typeof cards> = {};
    const untagged: typeof cards = [];

    for (const card of cards) {
        if (card.tag) {
            if (!grouped[card.tag]) {
                grouped[card.tag] = [];
            }
            grouped[card.tag].push(card);
        } else {
            untagged.push(card);
        }
    }

    // Convert to array format
    const groups = Object.entries(grouped)
        .map(([tag, cards]) => ({ tag, cards }))
        .sort((a, b) => a.tag.localeCompare(b.tag));

    // Add untagged at the end
    if (untagged.length > 0) {
        groups.push({ tag: "Untagged", cards: untagged });
    }

    return { success: true, groups };
}
