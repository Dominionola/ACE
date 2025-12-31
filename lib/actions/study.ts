"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// Study Sessions
// ============================================

export interface StudySession {
    id: string;
    user_id: string;
    subject_name: string;
    duration_minutes: number;
    study_date: string;
    notes?: string;
    created_at: string;
}

export async function logStudySession(
    subject: string,
    durationMinutes: number,
    notes?: string
): Promise<{ success: boolean; error?: string; xpGained?: number; newBadges?: any[] }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from("study_sessions").insert({
        user_id: user.id,
        subject_name: subject,
        duration_minutes: durationMinutes,
        notes,
    });

    if (error) {
        console.error("Error logging session:", error);
        return { success: false, error: "Failed to log session" };
    }

    // Trigger Gamification Updates
    // We import dynamically to avoid circular dependencies if any (though currently safe)
    const { updateGamificationStats } = await import("@/lib/actions/gamification");
    const { xpGained, newBadges } = await updateGamificationStats(durationMinutes);

    revalidatePath("/dashboard");
    return { success: true, xpGained, newBadges };
}

export async function getStudySessionsForWeek(): Promise<{
    sessions: StudySession[];
    totalMinutes: number;
    bySubject: Record<string, number>;
}> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { sessions: [], totalMinutes: 0, bySubject: {} };

    // Get sessions from last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: sessions } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("study_date", weekAgo.toISOString().split("T")[0])
        .order("created_at", { ascending: false });

    const allSessions = sessions || [];
    const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration_minutes, 0);

    // Group by subject
    const bySubject: Record<string, number> = {};
    for (const s of allSessions) {
        bySubject[s.subject_name] = (bySubject[s.subject_name] || 0) + s.duration_minutes;
    }

    return { sessions: allSessions, totalMinutes, bySubject };
}

// ============================================
// Exams
// ============================================

export interface Exam {
    id: string;
    user_id: string;
    subject_name: string;
    exam_date: string;
    exam_type: string;
    notes?: string;
    created_at: string;
}

export async function addExam(
    subject: string,
    examDate: string,
    examType: string = "Final",
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from("exams").insert({
        user_id: user.id,
        subject_name: subject,
        exam_date: examDate,
        exam_type: examType,
        notes,
    });

    if (error) {
        console.error("Error adding exam:", error);
        return { success: false, error: "Failed to add exam" };
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function getUpcomingExams(): Promise<Exam[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
        .from("exams")
        .select("*")
        .eq("user_id", user.id)
        .gte("exam_date", today)
        .order("exam_date", { ascending: true })
        .limit(10);

    return data || [];
}

export async function deleteExam(examId: string): Promise<{ success: boolean }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    await supabase.from("exams").delete().eq("id", examId).eq("user_id", user.id);
    revalidatePath("/dashboard");
    return { success: true };
}


