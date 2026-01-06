"use server";

import { createClient } from "@/lib/supabase/server";
import { AdaptiveEngine, ReviewItem } from "@/lib/learning/adaptive-engine";
import { revalidatePath } from "next/cache";

// ============================================
// Flashcard Reviews (Spaced Repetition)
// ============================================

export async function submitCardReview(cardId: string, rating: number) {
    // Rating: 0 (forgot) to 5 (perfect)
    if (rating < 0 || rating > 5) {
        return { success: false, error: "Invalid rating: must be between 0 and 5" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // 1. Fetch current card state
    const { data: card, error: fetchError } = await supabase
        .from("cards")
        .select("*")
        .eq("id", cardId)
        .eq("user_id", user.id)
        .single();

    if (fetchError || !card) {
        return { success: false, error: "Card not found or access denied" };
    }

    // 2. Map to ReviewItem
    const reviewItem: ReviewItem = {
        id: card.id,
        topic: "general", // TODO: Get topic from deck
        level: "intermediate", // Placeholder
        lastReview: new Date(card.last_reviewed || Date.now()),
        nextReview: new Date(card.next_review || Date.now()),
        interval: card.interval || 0,
        easeFactor: card.ease_factor || 2.5,
        reviewCount: card.repetitions || 0,
    };

    // 3. Calculate next review
    const updatedItem = AdaptiveEngine.scheduleNextReview(reviewItem, rating);

    // 4. Update Database
    const { error: updateError } = await supabase
        .from("cards")
        .update({
            last_reviewed: new Date().toISOString(),
            next_review: updatedItem.nextReview.toISOString(),
            interval: updatedItem.interval,
            ease_factor: updatedItem.easeFactor,
            repetitions: updatedItem.reviewCount,
        })
        .eq("id", cardId);

    if (updateError) {
        console.error("Failed to update card:", updateError);
        return { success: false, error: "Failed to update review" };
    }

    revalidatePath("/dashboard");
    return { success: true, nextReview: updatedItem.nextReview };
}

// ============================================
// Learning Profile (Insights & Difficulty)
// ============================================

export async function getLearnerProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch active insights
    const { data: insights, error } = await supabase
        .from("learning_insights")
        .select("*")
        .eq("user_id", user.id);

    if (error) {
        console.error("Failed to fetch learning insights:", error);
        return null;
    }

    return {
        strengths: insights?.filter(i => i.insight_type === 'strength') || [],
        weaknesses: insights?.filter(i => i.insight_type === 'weakness') || [],
        patterns: insights?.filter(i => i.insight_type === 'pattern') || [],
    };
}

export async function updateLearnerDifficulty(subject: string, score: number) {
    // This would effectively update the difficulty based on recent performance
    // For now, simpler implementation:
    // We can store a 'recommendation' insight for difficulty

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Logic to update difficulty would go here, possibly updating a user_settings table
    // or adding a new insight.
    // For MVP, we'll log it as a pattern insight.
}
