"use server";

import { createClient } from "@/lib/supabase/server";
import { type Deck } from "@/lib/schemas/deck";

export async function getPublicDecks(): Promise<Deck[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching public decks:", error);
        return [];
    }

    return data || [];
}

export async function cloneDeck(deckId: string): Promise<{ success: boolean; newDeckId?: string; error?: string }> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Fetch the original deck
    const { data: originalDeck, error: deckError } = await supabase
        .from("decks")
        .select("*")
        .eq("id", deckId)
        .eq("is_public", true)
        .single();

    if (deckError || !originalDeck) {
        return { success: false, error: "Deck not found or not public" };
    }

    // Clone the deck
    const { data: newDeck, error: insertError } = await supabase
        .from("decks")
        .insert({
            user_id: user.id,
            title: `${originalDeck.title} (Copy)`,
            description: originalDeck.description,
            is_public: false, // Cloned decks are private by default
            tags: originalDeck.tags,
        })
        .select("id")
        .single();

    if (insertError || !newDeck) {
        return { success: false, error: "Failed to clone deck" };
    }

    // Clone associated documents
    const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .eq("deck_id", deckId);

    if (docs && docs.length > 0) {
        const newDocs = docs.map(doc => ({
            deck_id: newDeck.id,
            file_name: doc.file_name,
            file_url: doc.file_url, // Reference same file
            extracted_text: doc.extracted_text,
        }));

        await supabase.from("documents").insert(newDocs);
    }

    return { success: true, newDeckId: newDeck.id };
}
