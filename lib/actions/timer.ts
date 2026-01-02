"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Type for active study session stored in database
interface ActiveStudySession {
    mode: "focus" | "break";
    time_remaining: number; // seconds
    sessions_completed: number;
    started_at: string;
    last_updated_at: string;
    focus_duration: number;
    break_duration: number;
}

/**
 * Save or update the current timer state to database
 */
export async function saveTimerState(state: {
    mode: "focus" | "break";
    timeRemaining: number;
    sessionsCompleted: number;
    focusDuration: number;
    breakDuration: number;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("active_study_sessions")
        .upsert({
            user_id: user.id,
            mode: state.mode,
            time_remaining: state.timeRemaining,
            sessions_completed: state.sessionsCompleted,
            focus_duration: state.focusDuration,
            break_duration: state.breakDuration,
            last_updated_at: new Date().toISOString(),
        }, {
            onConflict: "user_id"
        });

    if (error) {
        console.error("Failed to save timer state:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Load the saved timer state from database
 */
export async function loadTimerState(): Promise<{
    success: boolean;
    data?: ActiveStudySession;
    error?: string;
}> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
        .from("active_study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
        console.error("Failed to load timer state:", error);
        return { success: false, error: error.message };
    }

    if (!data) {
        return { success: true, data: undefined };
    }

    return {
        success: true,
        data: {
            mode: data.mode,
            time_remaining: data.time_remaining,
            sessions_completed: data.sessions_completed,
            started_at: data.created_at,
            last_updated_at: data.last_updated_at,
            focus_duration: data.focus_duration,
            break_duration: data.break_duration,
        }
    };
}

/**
 * Clear the saved timer state (called when timer completes or is manually stopped)
 */
export async function clearTimerState() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("active_study_sessions")
        .delete()
        .eq("user_id", user.id);

    if (error) {
        console.error("Failed to clear timer state:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Keep session alive - called periodically during active study
 * This refreshes the auth session to prevent timeout
 */
export async function keepSessionAlive() {
    const supabase = await createClient();

    // getUser() automatically refreshes the session if needed
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return { success: false, error: "Session expired" };
    }

    // Also update the last_updated_at timestamp on active session
    await supabase
        .from("active_study_sessions")
        .update({ last_updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

    return { success: true };
}
