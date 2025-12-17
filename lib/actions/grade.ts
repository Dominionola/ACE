"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
    InsertGradeHistorySchema,
    InsertSubjectGoalSchema,
    GradeHistorySchema,
    SubjectGoalSchema
} from "@/lib/schemas/grade";

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
    const { error } = await supabase.from("grade_history").delete().eq("id", id);

    if (error) {
        return { success: false, error: "Failed to delete grade" };
    }

    revalidatePath("/dashboard/grades");
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
        // Upsert based on user_id and subject_name unique constraint (assuming we add one)
        // For now, we'll just insert/upsert. 
        // Logic: specific subjects should be unique per user.
        // We might need to ensure the DB schema supports this constraint or handle it here.
        // Let's assume a simple insert for now, or use upsert if we had a unique constraint.
        // Since I can't easily change DB constraints right now without SQL editor or migrations, 
        // I will check if it exists first.

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
