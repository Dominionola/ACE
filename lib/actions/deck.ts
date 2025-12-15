"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InsertDeckSchema, type Deck, type DeckWithCards } from "@/lib/schemas/deck";

// ============================================
// Create Deck
// ============================================

interface CreateDeckResult {
    success: boolean;
    error?: string;
    deckId?: string;
}

export async function createDeck(formData: FormData): Promise<CreateDeckResult> {
    const supabase = await createClient();

    // Get authenticated user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "You must be logged in to create a deck" };
    }

    // Parse and validate form data
    const rawData = {
        title: formData.get("title"),
        description: formData.get("description") || undefined,
        is_public: formData.get("is_public") === "true",
        tags: formData.get("tags")
            ? String(formData.get("tags")).split(",").map((t) => t.trim()).filter(Boolean)
            : [],
    };

    const result = InsertDeckSchema.safeParse(rawData);

    if (!result.success) {
        return { success: false, error: result.error.errors[0]?.message || "Invalid input" };
    }

    // Insert into database
    const { data, error } = await supabase
        .from("decks")
        .insert({
            ...result.data,
            user_id: user.id,
        })
        .select("id")
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/decks");
    return { success: true, deckId: data.id };
}

// ============================================
// Get All Decks for Current User
// ============================================

export async function getDecks(): Promise<Deck[]> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching decks:", error);
        return [];
    }

    return data || [];
}

// ============================================
// Get Single Deck with Cards
// ============================================

export async function getDeckById(id: string): Promise<DeckWithCards | null> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Fetch deck
    const { data: deck, error: deckError } = await supabase
        .from("decks")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (deckError || !deck) {
        return null;
    }

    // Fetch cards
    const { data: cards, error: cardsError } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", id)
        .order("created_at", { ascending: true });

    if (cardsError) {
        console.error("Error fetching cards:", cardsError);
        return { ...deck, cards: [] };
    }

    return { ...deck, cards: cards || [] };
}

// ============================================
// Delete Deck
// ============================================

export async function deleteDeck(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/decks");
    return { success: true };
}
