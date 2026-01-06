/**
 * Coaching Engine
 * 
 * Generates proactive prompts based on user state and learning insights.
 */

import { createClient } from "@/lib/supabase/server";

export type CoachingTrigger =
    | 'exam_upcoming'
    | 'study_break'
    | 'study_streak'
    | 'missed_goal'
    | 'topic_weakness';

export interface CoachingPrompt {
    type: CoachingTrigger;
    message: string;
    actionLabel?: string;
    actionUrl?: string;
    priority: 'high' | 'medium' | 'low';
}

export class CoachingEngine {

    /**
     * Check for active coaching opportunities
     */
    static async checkTriggers(userId: string): Promise<CoachingPrompt | null> {
        const supabase = await createClient();

        // 1. Check Upcoming Exams (High Priority)
        const { data: exams } = await supabase
            .from("exams")
            .select("*")
            .eq("user_id", userId)
            .gte("exam_date", new Date().toISOString())
            .order("exam_date", { ascending: true })
            .limit(1);

        if (exams && exams.length > 0) {
            const nextExam = exams[0];
            const daysUntil = Math.ceil((new Date(nextExam.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            if (daysUntil <= 3 && daysUntil > 0) {
                return {
                    type: 'exam_upcoming',
                    message: `You have a ${nextExam.subject_name} exam in ${daysUntil} days. Ready for a practice test?`,
                    actionLabel: "Start Practice Quiz",
                    actionUrl: `/dashboard/quiz?subject=${encodeURIComponent(nextExam.subject_name)}`,
                    priority: 'high'
                };
            }
        }

        // 2. Check Study Streak (Medium Priority)
        // Only if no high priority exam prompt
        // TODO: Get streak from gamification stats (mock for now)
        // const streak = await getUserStreak(userId);
        // if (streak > 0 && !hasStudiedToday(userId)) ...

        // 3. Weakness Review (Medium Priority)
        const { data: insights } = await supabase
            .from("learning_insights")
            .select("*")
            .eq("user_id", userId)
            .eq("insight_type", "weakness")
            .limit(1);

        if (insights && insights.length > 0) {
            const weakness = insights[0];
            return {
                type: 'topic_weakness',
                message: `We noticed you're struggling with ${weakness.subject}. Want to review specific flashcards?`,
                actionLabel: "Review Now",
                actionUrl: `/dashboard/decks?filter=weakness`, // Conceptual URL
                priority: 'medium'
            };
        }

        return null;
    }
}
