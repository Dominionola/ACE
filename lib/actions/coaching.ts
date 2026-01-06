"use server";

import { createClient } from "@/lib/supabase/server";
import { CoachingEngine, CoachingPrompt } from "@/lib/coaching/engine";

export async function getCoachingPrompt(): Promise<CoachingPrompt | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    try {
        // Check triggers
        const prompt = await CoachingEngine.checkTriggers(user.id);

        // Use the db table 'coaching_prompts' to avoid showing same prompt too often if needed
        // For now, we'll serve it directly for real-time responsiveness

        return prompt;
    } catch (error) {
        console.error("Coaching engine error:", error);
        return null;
    }
}

export async function dismissPrompt(promptType: string) {
    // Logic to snooze or dismiss prompt so it doesn't show again immediately
    // Could track in 'coaching_prompts' table
    return { success: true };
}
