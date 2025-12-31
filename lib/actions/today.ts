"use server";

import { createClient } from "@/lib/supabase/server";
import { getWeeklyFocus } from "@/lib/actions/strategy";
import { generateWeeklySchedule, getWeekNumber, ScheduleBlock } from "@/lib/utils/schedule";

// Map JS day (0=Sun, 1=Mon) to our array index (0=Mon, ..., 6=Sun)
// WEEKDAYS: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
function getDayIndex(date: Date): number {
    const day = date.getDay(); // 0=Sun, 1=Mon
    return day === 0 ? 6 : day - 1;
}

export async function getTodaysPlan(): Promise<{ blocks: ScheduleBlock[]; weekNumber: number; dayName: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { blocks: [], weekNumber: 0, dayName: "" };

    // 1. Find the most recent/active semester (naive approach: just get the latest updated strategy)
    // 1. Find the most recent/active semester that HAS a focus plan
    const { data: strategies } = await supabase
        .from("study_strategies")
        .select("semester, weekly_focus, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5); // Check last 5 updated semesters

    // Find first strategy with actual focus items
    const latestStrategy = strategies?.find(s =>
        s.weekly_focus &&
        Array.isArray(s.weekly_focus) &&
        s.weekly_focus.length > 0
    );

    if (!latestStrategy || !latestStrategy.weekly_focus || latestStrategy.weekly_focus.length === 0) {
        return { blocks: [], weekNumber: 0, dayName: "" };
    }

    // 2. Generate schedule for this week
    const weekNumber = getWeekNumber();
    const schedule = generateWeeklySchedule(latestStrategy.weekly_focus, undefined, undefined, weekNumber);

    // 3. Get today's blocks
    const todayIndex = getDayIndex(new Date());
    const daySchedule = schedule.days[todayIndex];

    return {
        blocks: daySchedule.blocks,
        weekNumber,
        dayName: daySchedule.day
    };
}
