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

// Helper function to parse weekly focus from AI-generated strategy text
function parseWeeklyFocusFromStrategy(strategyText: string): { subject: string; hours: number }[] {
    const focusItems: { subject: string; hours: number }[] = [];

    // Find the Weekly Focus section
    const weeklyFocusMatch = strategyText.match(/###?\s*📅?\s*Weekly Focus[\s\S]*?(?=###|💡|$)/i);
    if (!weeklyFocusMatch) return focusItems;

    const section = weeklyFocusMatch[0];

    // Pattern to match "Subject Name: X hours" - handles inline format
    // Matches: "Data Structure & Algorithms: 5 hours" or "HCNA: 4 hours"
    // Works both for newline-separated and inline formats
    const pattern = /([A-Za-z][A-Za-z0-9\s&\-\(\)]+?):\s*(\d+)\s*hours?/gi;
    let match;

    while ((match = pattern.exec(section)) !== null) {
        let subject = match[1].trim();
        const hours = parseInt(match[2], 10);

        // Clean up the subject name
        subject = subject
            .replace(/^\*\*/, '')  // Remove leading **
            .replace(/\*\*$/, '')  // Remove trailing **
            .replace(/^[\-•*]\s*/, '') // Remove bullet points
            .trim();

        // Skip if it's a section header or too short
        if (subject && subject.length > 2 && hours > 0 && hours <= 20) {
            // Avoid duplicates
            if (!focusItems.find(f => f.subject.toLowerCase() === subject.toLowerCase())) {
                focusItems.push({ subject, hours });
            }
        }
    }

    return focusItems;
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

    const prompt = `You are a concise academic advisor. Analyze these ${semester} grades and provide a SHORT, actionable study strategy.

## Student Data:
${subjectData.map(s => `- ${s.subject}: Got ${s.grade}, Target: ${s.target}`).join('\n')}

## Respond with ONLY these sections (keep each brief - 3-5 lines max):

### 🎯 Top 3 Priority Subjects
List the 3 subjects needing most attention with ONE reason each.

### 📅 Weekly Focus
A simple weekly hour allocation for the top 5 struggling subjects. Format each line exactly as: "Subject Name: X hours"

### 💡 Quick Wins
3 specific techniques to improve weakest subjects.

### 🔥 Motivation
One short encouraging sentence.

Keep the ENTIRE response under 300 words. Be direct, no fluff.`;

    try {
        const { text } = await generateText({
            model: google("gemini-2.5-flash-lite"),
            prompt,
        });

        // Parse weekly focus from the AI response
        const parsedWeeklyFocus = parseWeeklyFocusFromStrategy(text);

        // Save to database (upsert) with parsed weekly focus
        const { error } = await supabase
            .from("study_strategies")
            .upsert({
                user_id: user.id,
                semester,
                strategy_content: text,
                weekly_focus: parsedWeeklyFocus,
            }, { onConflict: 'user_id, semester' });

        if (error) {
            console.error("Error saving strategy:", error);
            return { success: false, error: "Failed to save strategy." };
        }

        revalidatePath(`/dashboard/grades/${encodeURIComponent(semester)}`);
        return { success: true, data: text, weeklyFocus: parsedWeeklyFocus };

    } catch (error: any) {
        console.error("AI generation error:", error);
        const errorMessage = error?.message || error?.toString() || "Unknown error";
        return { success: false, error: `Failed to generate: ${errorMessage}` };
    }
}

// --- Weekly Focus Management ---

interface FocusItem {
    subject: string;
    hours: number;
}

export async function saveWeeklyFocus(semester: string, focusItems: FocusItem[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Store in study_strategies table as JSON in a new column
    // Or create a separate table - for simplicity, we'll use the existing strategy record
    const { data: existingStrategy } = await supabase
        .from("study_strategies")
        .select("*")
        .eq("user_id", user.id)
        .eq("semester", semester)
        .single();

    if (existingStrategy) {
        const { error } = await supabase
            .from("study_strategies")
            .update({ weekly_focus: focusItems })
            .eq("id", existingStrategy.id);

        if (error) {
            console.error("Error saving weekly focus:", error);
            return { success: false, error: "Failed to save weekly focus." };
        }
    } else {
        // Create a new strategy record with just weekly focus
        const { error } = await supabase
            .from("study_strategies")
            .insert({
                user_id: user.id,
                semester,
                strategy_content: "",
                weekly_focus: focusItems,
            });

        if (error) {
            console.error("Error creating weekly focus:", error);
            return { success: false, error: "Failed to save weekly focus." };
        }
    }

    revalidatePath(`/dashboard/grades/${encodeURIComponent(semester)}`);
    return { success: true };
}

export async function getWeeklyFocus(semester: string): Promise<FocusItem[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("study_strategies")
        .select("weekly_focus")
        .eq("user_id", user.id)
        .eq("semester", semester)
        .single();

    return data?.weekly_focus || [];
}

