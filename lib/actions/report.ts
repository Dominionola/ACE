"use server";

import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getWeekNumber, getWeekDateRange } from "@/lib/utils/schedule";
import { revalidatePath } from "next/cache";

export async function generateWeeklyReport() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Rate Limit Check
    const { checkRateLimit, AI_RATE_LIMIT } = await import("@/lib/rate-limit");
    const rateCheck = await checkRateLimit(`report:${user.id}`, AI_RATE_LIMIT); if (!rateCheck.success) {
        return { success: false, error: `Rate limit exceeded. Try again in ${Math.ceil(rateCheck.resetIn / 60000)} minutes.` };
    }

    try {
        // 1. Get Date Range for Current Week
        const currentWeekParam = getWeekNumber();
        const { start, end } = getWeekDateRange(currentWeekParam);
        const startDateStr = start.toISOString().split('T')[0];

        // 2. Fetch Study Data for this week
        const { data: sessions } = await supabase
            .from("study_sessions")
            .select("subject_name, duration_minutes, created_at")
            .eq("user_id", user.id)
            .gte("created_at", startDateStr);

        // 3. Fetch User Stats (Total XP, etc)
        const { data: stats } = await supabase
            .from("user_stats")
            .select("*")
            .eq("user_id", user.id)
            .single();

        // 4. Aggregate Data
        const totalMinutes = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;
        const totalSessions = sessions?.length || 0;
        const subjectBreakdown: Record<string, number> = {};
        sessions?.forEach(s => {
            subjectBreakdown[s.subject_name] = (subjectBreakdown[s.subject_name] || 0) + s.duration_minutes;
        });

        // 4.5 Check for minimum data requirements
        if (totalSessions === 0 && totalMinutes === 0) {
            return {
                success: false,
                error: "Not enough data yet! Complete some study sessions first to generate your coaching report."
            };
        }

        // 5. Generate AI Report
        const prompt = `
        You are an elite academic coach. Analyze this student's weekly progress and generate a brutally honest but encouraging report.
        
        ## Data for Week ${currentWeekParam}:
        - Total Study Time: ${totalMinutes} minutes
        - Sessions Completed: ${totalSessions}
        - Subject Breakdown: ${JSON.stringify(subjectBreakdown)}
        - Current XP Level: ${stats?.level || 1}
        - Total XP: ${stats?.xp || 0}

        ## Output JSON ONLY (No markdown formatting):
        {
            "summary": "2-3 sentences summarizing performance. Be specific.",
            "highlights": ["Bullet point 1 (achievement)", "Bullet point 2 (milestone)"],
            "focus_next_week": ["Actionable tip 1", "Actionable tip 2"],
            "grade_trend": "Improving" | "Stable" | "Needs Attention"
        }
        `;

        const { text } = await generateText({
            model: google("gemini-1.5-flash"),
            prompt: prompt,
        });

        // 6. Clean and Parse JSON
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const reportContent = JSON.parse(cleanedText);

        // 7. Save to DB
        const { error } = await supabase.from("weekly_reports").insert({
            user_id: user.id,
            week_start: startDateStr,
            week_number: currentWeekParam,
            total_minutes: totalMinutes,
            xp_earned: 0, // We could calculate delta if we tracked it, for now 0 or estimate
            sessions_completed: totalSessions,
            report_content: reportContent
        });

        if (error) throw error;

        revalidatePath("/dashboard");
        return { success: true, report: reportContent };

    } catch (error: any) {
        console.error("Report Generation Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getLatestWeeklyReport() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from("weekly_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    return data;
}
