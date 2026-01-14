"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { BADGES, UserStats } from "@/lib/gamification";

export async function getUserStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!stats) {
        // Initialize if not exists
        const { data: newStats, error } = await supabase
            .from("user_stats")
            .insert({ user_id: user.id })
            .select()
            .single();

        if (error) return null;
        return { ...newStats, badges: [] };
    }

    const { data: badges } = await supabase
        .from("user_badges")
        .select("badge_code")
        .eq("user_id", user.id);

    return {
        ...stats,
        badges: badges?.map(b => b.badge_code) || []
    };
}

export async function updateGamificationStats(minutes: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    // 1. Get current stats
    let { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!stats) {
        // Init
        const { data } = await supabase
            .from("user_stats")
            .insert({ user_id: user.id })
            .select()
            .single();
        stats = data;
    }

    // 2. Calculate Streak
    const today = new Date();
    const lastDate = stats.last_study_date ? new Date(stats.last_study_date) : null;

    // Normalize to midnight for comparison
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastMidnight = lastDate ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()) : null;

    let newStreak = stats.current_streak;

    if (!lastMidnight) {
        // First time
        newStreak = 1;
    } else {
        const diffTime = Math.abs(todayMidnight.getTime() - lastMidnight.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            newStreak += 1;
        } else if (diffDays > 1) {
            // Streak broken
            newStreak = 1;
        }
        // If diffDays === 0 (same day), keep streak same
    }

    const newLongest = Math.max(stats.longest_streak, newStreak);
    const newTotalMinutes = stats.total_minutes_studied + minutes;

    // XP Calculation: 1 min = 10 XP + Streak Bonus (10%)
    const xpGained = Math.round(minutes * 10 * (1 + newStreak * 0.1));
    const newXp = stats.xp + xpGained;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1; // Simple quadratic curve

    // 3. Update Stats
    await supabase.from("user_stats").update({
        current_streak: newStreak,
        longest_streak: newLongest,
        total_minutes_studied: newTotalMinutes,
        xp: newXp,
        level: newLevel,
        last_study_date: new Date().toISOString().split('T')[0]
    }).eq("user_id", user.id);

    // 4. Check Badges
    const earnedBadges: string[] = [];

    // Helper to award
    const award = async (code: string) => {
        // Check if already has
        const { count } = await supabase
            .from("user_badges")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id)
            .eq("badge_code", code);

        if (count === 0) {
            await supabase.from("user_badges").insert({ user_id: user.id, badge_code: code });
            earnedBadges.push(code);
        }
    };

    // Rules
    await award("FIRST_SESSION");
    if (newStreak >= 3) await award("STREAK_3");
    if (newStreak >= 7) await award("STREAK_7");
    if (newTotalMinutes >= 1000) await award("FOCUS_MASTER");

    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 4) await award("NIGHT_OWL");
    if (currentHour >= 5 && currentHour < 7) await award("EARLY_BIRD");

    revalidatePath("/dashboard");
    return {
        success: true,
        xpGained,
        newBadges: earnedBadges.map(code => BADGES.find(b => b.code === code))
    };
}

export async function awardXP(amount: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single();
    if (!stats) return { success: false };

    const newXp = stats.xp + amount;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    await supabase.from("user_stats").update({
        xp: newXp,
        level: newLevel
    }).eq("user_id", user.id);

    revalidatePath("/dashboard");
    return { success: true, newXP: newXp, newLevel };
}
