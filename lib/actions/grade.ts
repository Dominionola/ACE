"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
    InsertGradeHistorySchema,
    InsertSubjectGoalSchema,
    GradeHistorySchema,
    SubjectGoalSchema
} from "@/lib/schemas/grade";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function logGrade(input: unknown) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const result = GradeHistorySchema.safeParse(input);

    if (!result.success) {
        return { success: false, error: "Invalid grade data" };
    }

    try {
        const { error } = await supabase.from("grade_history").insert({
            ...result.data,
            user_id: user.id
        });

        if (error) throw error;

        revalidatePath("/dashboard/grades");
        return { success: true };
    } catch (error) {
        console.error("Error logging grade:", error);
        return { success: false, error: "Failed to log grade" };
    }
}

export async function getGrades() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("grade_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching grades:", error);
        return [];
    }

    return data;
}

export async function deleteGrade(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Delete with ownership check (RLS also enforces this, but explicit is better)
    const { error } = await supabase
        .from("grade_history")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return { success: false, error: "Failed to delete grade" };
    }

    revalidatePath("/dashboard/grades");
    return { success: true };
}

// ============================================
// Delete Entire Semester (Grades, Goals, Decks)
// ============================================

export async function deleteSemester(semester: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // 1. Delete all grades for this semester
    const { error: gradesError } = await supabase
        .from("grade_history")
        .delete()
        .eq("user_id", user.id)
        .eq("semester", semester);

    if (gradesError) {
        console.error("Error deleting grades:", gradesError);
        return { success: false, error: "Failed to delete grades" };
    }

    // 2. Delete auto-generated decks for this semester
    const { error: decksError } = await supabase
        .from("decks")
        .delete()
        .eq("user_id", user.id)
        .eq("semester", semester)
        .eq("subject_source", "grades");

    if (decksError) {
        console.error("Error deleting decks:", decksError);
        // Non-fatal - grades are already deleted
    }

    // 3. Delete study strategies for this semester
    const { error: strategiesError } = await supabase
        .from("study_strategies")
        .delete()
        .eq("user_id", user.id)
        .eq("semester", semester);

    if (strategiesError) {
        console.error("Error deleting strategies:", strategiesError);
        // Non-fatal
    }

    // 4. Delete weekly focus for this semester
    const { error: focusError } = await supabase
        .from("weekly_focus")
        .delete()
        .eq("user_id", user.id)
        .eq("semester", semester);

    if (focusError) {
        console.error("Error deleting weekly focus:", focusError);
        // Non-fatal
    }

    revalidatePath("/dashboard/grades");
    revalidatePath("/dashboard/decks");
    return { success: true };
}

// --- Goals ---

export async function setSubjectGoal(input: unknown) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const result = SubjectGoalSchema.safeParse(input);

    if (!result.success) {
        return { success: false, error: "Invalid goal data" };
    }

    try {
        const { data: existing } = await supabase
            .from("subject_goals")
            .select("id")
            .eq("user_id", user.id)
            .eq("subject_name", result.data.subject_name)
            .single();

        let error;
        if (existing) {
            const updateRes = await supabase.from("subject_goals").update({
                target_grade: result.data.target_grade
            }).eq("id", existing.id);
            error = updateRes.error;
        } else {
            const insertRes = await supabase.from("subject_goals").insert({
                ...result.data,
                user_id: user.id
            });
            error = insertRes.error;
        }

        if (error) throw error;

        revalidatePath("/dashboard/grades");
        return { success: true };
    } catch (error) {
        console.error("Error setting goal:", error);
        return { success: false, error: "Failed to set goal" };
    }
}

export async function getSubjectGoals() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("subject_goals")
        .select("*")
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching goals:", error);
        return [];
    }

    return data;
}

// --- Report Card Extraction ---

const ExtractedGradesSchema = z.object({
    grades: z.array(z.object({
        subject_name: z.string(),
        grade: z.string().describe("The numeric or letter grade value"),
    }))
});

export async function extractGradesFromReport(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file) {
        return { success: false, error: "No file provided" };
    }

    // File size validation (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: "File too large. Maximum size is 10MB." };
    }

    // Auth & Rate Limit
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const { checkRateLimit, AI_RATE_LIMIT } = await import("@/lib/rate-limit");
    const rateCheck = checkRateLimit(`extract:${user.id}`, AI_RATE_LIMIT);
    if (!rateCheck.success) {
        return { success: false, error: `Rate limit exceeded. Try again in ${Math.ceil(rateCheck.resetIn / 60000)} minutes.` };
    }

    try {
        const isPdf = file.type === "application/pdf";
        let promptContent: any[] = [];

        if (isPdf) {
            // PDF Text Extraction
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Dynamic import to avoid build issues (same as document.ts)
            const pdfParse = (await import("pdf-parse")).default;
            // @ts-ignore - pdf-parse types are messy
            const data = await pdfParse(buffer);

            promptContent = [{ type: 'text', text: `Extract grades from this text:\n${data.text}` }];
        } else {
            // Image Processing
            const arrayBuffer = await file.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");

            promptContent = [
                { type: 'text', text: "Extract all list of subjects and their corresponding grades/scores from this report card image." },
                { type: 'image', image: base64 }
            ];
        }

        const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: ExtractedGradesSchema,
            system: "You are an expert data extraction assistant. Your task is to identify and extract all academic subjects and their corresponding grades, marks, or scores from the provided document. Return them as a strict JSON array.",
            messages: [
                { role: "user" as const, content: promptContent }
            ]
        });

        return { success: true, data: object.grades };

    } catch (error) {
        console.error("Extraction error:", error);
        return { success: false, error: "Failed to extract data. Please ensure the file is clear." };
    }
}

export async function bulkLogGrades(grades: { subject_name: string, grade_value: string, semester: string }[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from("grade_history").insert(
        grades.map(g => ({ ...g, user_id: user.id }))
    );

    if (error) {
        console.error("Bulk log error:", error);
        return { success: false, error: "Failed to save grades." };
    }

    // Auto-create study decks for each subject
    const { createDecksForSubjects } = await import("@/lib/actions/deck");
    const uniqueSubjects = [...new Map(grades.map(g =>
        [`${g.subject_name}-${g.semester}`, { subject_name: g.subject_name, semester: g.semester }]
    )).values()];

    await createDecksForSubjects(uniqueSubjects, 'grades');

    revalidatePath("/dashboard/grades");
    revalidatePath("/dashboard/decks");
    return { success: true, decksCreated: uniqueSubjects.length };
}

export async function bulkSetGoals(goals: { subject_name: string, target_grade: string }[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    // Using upsert with conflict handling
    const { error } = await supabase.from("subject_goals").upsert(
        goals.map(g => ({ ...g, user_id: user.id })),
        { onConflict: 'user_id, subject_name' }
    );

    if (error) {
        console.error("Bulk goal error:", error);
        return { success: false, error: "Failed to save goals." };
    }

    revalidatePath("/dashboard/grades");
    return { success: true };
}

export async function getUniqueSubjects() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Fetch distinct subjects from both history and goals
    const { data: grades } = await supabase.from("grade_history").select("subject_name").eq("user_id", user.id);
    const { data: goals } = await supabase.from("subject_goals").select("subject_name").eq("user_id", user.id);

    const subjects = new Set<string>();
    grades?.forEach(g => subjects.add(g.subject_name));
    goals?.forEach(g => subjects.add(g.subject_name));

    return Array.from(subjects).sort().map(s => ({ value: s, label: s }));
}

export async function getUniqueSemesters() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase.from("grade_history").select("semester").eq("user_id", user.id);

    const semesters = new Set<string>();
    data?.forEach(d => {
        if (d.semester) semesters.add(d.semester);
    });

    return Array.from(semesters).sort();
}
