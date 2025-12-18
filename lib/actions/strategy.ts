"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function getGradesForSemester(semester: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { grades: [], goals: [] };

    const { data: grades } = await supabase
        .from("grade_history")
        .select("*")
        .eq("user_id", user.id)
        .eq("semester", semester);

    const { data: goals } = await supabase
        .from("subject_goals")
        .select("*")
        .eq("user_id", user.id);

    return { grades: grades || [], goals: goals || [] };
}

export async function getStudyStrategy(semester: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from("study_strategies")
        .select("*")
        .eq("user_id", user.id)
        .eq("semester", semester)
        .single();

    return data;
}

export async function generateStudyStrategy(semester: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Fetch grades and goals for the semester
    const { grades, goals } = await getGradesForSemester(semester);

    if (grades.length === 0) {
        return { success: false, error: "No grades found for this semester." };
    }

    // Build context for AI
    const subjectData = grades.map(g => {
        const goal = goals.find((gl: any) => gl.subject_name.toLowerCase() === g.subject_name.toLowerCase());
        return {
            subject: g.subject_name,
            grade: g.grade_value,
            target: goal?.target_grade || "Not set",
        };
    });

    const prompt = `You are an expert academic advisor. Analyze the following student grades and goals for ${semester}, then provide a detailed, actionable study strategy.

## Student Data:
${subjectData.map(s => `- ${s.subject}: Achieved ${s.grade}, Target: ${s.target}`).join('\n')}

## Your Task:
1. **Performance Summary**: Brief overview of strengths and weaknesses.
2. **Priority Subjects**: Which subjects need the most attention? Why?
3. **Study Schedule**: Suggest a weekly study plan (hours per subject).
4. **Techniques**: Recommend specific study methods for each weak subject.
5. **Motivation**: A short encouraging message.

Format your response in clear markdown with headers. Be specific and actionable.`;

    try {
        const { text } = await generateText({
            model: google("gemini-2.0-flash"),
            prompt,
        });

        // Save to database (upsert)
        const { error } = await supabase
            .from("study_strategies")
            .upsert({
                user_id: user.id,
                semester,
                strategy_content: text,
            }, { onConflict: 'user_id, semester' });

        if (error) {
            console.error("Error saving strategy:", error);
            return { success: false, error: "Failed to save strategy." };
        }

        revalidatePath(`/dashboard/grades/${encodeURIComponent(semester)}`);
        return { success: true, data: text };

    } catch (error) {
        console.error("AI generation error:", error);
        return { success: false, error: "Failed to generate strategy. Please try again." };
    }
}
