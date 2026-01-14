"use server";

import { createClient } from "@/lib/supabase/server";
import { WorkflowStage, WorkflowState } from "@/lib/workflows/engine";

// ============================================
// Types
// ============================================

interface StudySession {
    id: string;
    user_id: string;
    workflow_type: string;
    current_stage: WorkflowStage;
    session_state: WorkflowState;
    topics_covered: string[];
    started_at: string;
    last_activity: string;
    completed_at: string | null;
    total_duration_minutes: number;
}

// ============================================
// Session Management
// ============================================

/**
 * Start a new study session
 */
export async function startStudySession(): Promise<{
    success: boolean;
    session?: StudySession;
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const initialState: Partial<WorkflowState> = {
            currentStage: 'browse',
            selectedTopic: null,
            topicsCovered: [],
            quizScore: null,
            mistakes: [],
            startedAt: new Date(),
            lastActivity: new Date(),
        };

        const { data, error } = await supabase
            .from("study_sessions")
            .insert({
                user_id: user.id,
                workflow_type: 'study_session',
                current_stage: 'browse',
                session_state: initialState,
                topics_covered: [],
            })
            .select()
            .single();

        if (error) {
            console.error("Failed to start session:", error);
            return { success: false, error: error.message };
        }

        return { success: true, session: data };
    } catch (error) {
        console.error("Start session error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to start session"
        };
    }
}

/**
 * Get the active (uncompleted) study session for the current user
 */
export async function getActiveSession(): Promise<{
    success: boolean;
    session?: StudySession | null;
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("study_sessions")
            .select("*")
            .eq("user_id", user.id)
            .is("completed_at", null)
            .order("started_at", { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== "PGRST116") { // No rows returned
            console.error("Failed to get active session:", error);
            return { success: false, error: error.message };
        }

        return { success: true, session: data || null };
    } catch (error) {
        console.error("Get active session error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get session"
        };
    }
}

/**
 * Update the current session stage and state
 */
export async function updateSessionStage(
    sessionId: string,
    newStage: WorkflowStage,
    stateUpdates: Partial<WorkflowState>
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Get current session to merge state
        const { data: currentSession, error: fetchError } = await supabase
            .from("study_sessions")
            .select("session_state, topics_covered")
            .eq("id", sessionId)
            .eq("user_id", user.id)
            .single();

        if (fetchError) {
            console.error("Failed to fetch session:", fetchError);
            return { success: false, error: fetchError.message };
        }

        if (!currentSession) {
            return { success: false, error: "Session not found" };
        }
        const mergedState = {
            ...currentSession.session_state,
            ...stateUpdates,
            currentStage: newStage,
            lastActivity: new Date().toISOString(),
        };

        // Update topics if a new topic was selected
        let topics = currentSession.topics_covered || [];
        if (stateUpdates.selectedTopic && !topics.includes(stateUpdates.selectedTopic)) {
            topics = [...topics, stateUpdates.selectedTopic];
        }

        const { error } = await supabase
            .from("study_sessions")
            .update({
                current_stage: newStage,
                session_state: mergedState,
                topics_covered: topics,
                last_activity: new Date().toISOString(),
            })
            .eq("id", sessionId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Failed to update session:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Update session error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update session"
        };
    }
}

/**
 * Complete the current study session
 */
export async function completeSession(
    sessionId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Get session to calculate duration
        const { data: session } = await supabase
            .from("study_sessions")
            .select("started_at, session_state")
            .eq("id", sessionId)
            .eq("user_id", user.id)
            .single();

        if (!session) {
            return { success: false, error: "Session not found" };
        }

        const startedAt = new Date(session.started_at);
        const durationMinutes = Math.floor((Date.now() - startedAt.getTime()) / 60000);

        const { error } = await supabase
            .from("study_sessions")
            .update({
                current_stage: 'complete',
                completed_at: new Date().toISOString(),
                total_duration_minutes: durationMinutes,
                session_state: {
                    ...session.session_state,
                    currentStage: 'complete',
                },
            })
            .eq("id", sessionId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Failed to complete session:", error);
            return { success: false, error: error.message };
        }

        // Update Gamification Stats
        try {
            const { updateGamificationStats } = await import("./gamification");
            // Determine duration to reward
            // If durationMinutes is very large (left open), cap it, e.g., 120 mins
            const rewardMinutes = Math.min(durationMinutes, 120);
            if (rewardMinutes > 0) {
                await updateGamificationStats(rewardMinutes);
            }
        } catch (e) {
            console.error("Failed to update gamification stats:", e);
        }

        return { success: true };
    } catch (error) {
        console.error("Complete session error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to complete session"
        };
    }
}

/**
 * Get recent study sessions for analytics
 */
export async function getRecentSessions(limit: number = 10): Promise<{
    success: boolean;
    sessions?: StudySession[];
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("study_sessions")
            .select("*")
            .eq("user_id", user.id)
            .order("started_at", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Failed to get sessions:", error);
            return { success: false, error: error.message };
        }

        return { success: true, sessions: data };
    } catch (error) {
        console.error("Get sessions error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get sessions"
        };
    }
}
