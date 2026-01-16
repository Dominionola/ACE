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
        return { success: false, error: result.error.issues[0]?.message || "Invalid input" };
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

// ============================================
// Create Deck for Subject (Auto-generation)
// ============================================

interface CreateDeckForSubjectOptions {
    subjectName: string;
    semester?: string;
    source: 'grades' | 'goals';
}

export async function createDeckForSubject(options: CreateDeckForSubjectOptions): Promise<{ success: boolean; deckId?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false };
    }

    const { subjectName, semester, source } = options;

    // Check if deck already exists for this subject + semester
    const query = supabase
        .from("decks")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", subjectName);

    if (semester) {
        query.eq("semester", semester);
    }

    const { data: existing } = await query.single();

    if (existing) {
        // Deck already exists
        return { success: true, deckId: existing.id };
    }

    // Create new deck
    const tags = ["auto-generated"];
    if (semester) tags.push(semester);

    const { data, error } = await supabase
        .from("decks")
        .insert({
            title: subjectName,
            description: `Study deck for ${subjectName}${semester ? ` - ${semester}` : ""}`,
            user_id: user.id,
            is_public: false,
            tags,
            semester: semester || null,
            subject_source: source,
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error creating deck for subject:", error);
        return { success: false };
    }

    return { success: true, deckId: data.id };
}

// ============================================
// Bulk Create Decks for Subjects
// ============================================

export async function createDecksForSubjects(
    subjects: { subject_name: string; semester?: string }[],
    source: 'grades' | 'goals'
): Promise<{ created: number; existing: number }> {
    let created = 0;
    let existing = 0;

    for (const subject of subjects) {
        const result = await createDeckForSubject({
            subjectName: subject.subject_name,
            semester: subject.semester,
            source,
        });

        if (result.success) {
            // If deckId exists, we created or found it
            // We don't track which is which here, just count successes
            created++;
        }
    }

    revalidatePath("/dashboard/decks");
    return { created, existing };
}

// ============================================
// Get Decks Grouped by Semester
// ============================================

export async function getDecksGroupedBySemester(): Promise<{ semester: string; decks: Deck[] }[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", user.id)
        .order("semester", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

    if (error || !data) return [];

    // Group by semester
    const groups: Record<string, Deck[]> = {};
    const noSemester: Deck[] = [];

    for (const deck of data) {
        if (deck.semester) {
            if (!groups[deck.semester]) {
                groups[deck.semester] = [];
            }
            groups[deck.semester].push(deck);
        } else {
            noSemester.push(deck);
        }
    }

    // Convert to array format
    const result = Object.entries(groups)
        .map(([semester, decks]) => ({ semester, decks }))
        .sort((a, b) => b.semester.localeCompare(a.semester)); // Latest first

    // Add "Other" group for decks without semester
    if (noSemester.length > 0) {
        result.push({ semester: "Other", decks: noSemester });
    }

    return result;
}
