"use server";

import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// ============================================
// Schemas
// ============================================

const MilestoneSchema = z.object({
    title: z.string(),
    description: z.string(),
    days_from_start: z.number(), // Relative scheduling
    resources: z.array(z.string()).optional(),
});

const StudyPlanResponseSchema = z.object({
    milestones: z.array(MilestoneSchema),
});

export interface CreatePlanRequest {
    title: string;
    description?: string;
    targetDate: string; // ISO string
    topics: string[];
}

// ============================================
// Actions
// ============================================

export async function generateStudyPlan(request: CreatePlanRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // 1. Calculate duration
    const start = new Date();
    const target = new Date(request.targetDate);
    const daysUntil = Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 0) {
        return { success: false, error: "Target date must be in the future" };
    }

    // 2. Generate Plan with AI
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: StudyPlanResponseSchema,
            prompt: `Create a structured study plan for a student.
            
            Goal: ${request.title}
            Description: ${request.description || "Prepare for exam"}
            Topics: ${request.topics.join(", ")}
            Timeframe: ${daysUntil} days
            
            Requirements:
            - Break down the goal into 5-10 logical milestones.
            - Spread them out evenly over the ${daysUntil} days.
            - 'days_from_start' should be the day number (e.g. 1, 3, 7) when this milestone should be completed.
            - Be specific about what to study.
            `,
        });

        // 3. Save Plan to DB
        const { data: plan, error: planError } = await supabase
            .from("study_plans")
            .insert({
                user_id: user.id,
                title: request.title,
                description: request.description,
                target_date: request.targetDate,
                status: 'active'
            })
            .select()
            .single();

        if (planError || !plan) {
            console.error("Failed to create plan:", planError);
            return { success: false, error: "Failed to create study plan" };
        }

        // 4. Save Milestones
        const milestonesToInsert = object.milestones.map((m, index) => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + m.days_from_start);

            return {
                plan_id: plan.id,
                title: m.title,
                description: m.description,
                date_due: dueDate.toISOString(),
                order_index: index,
                resources: m.resources || [],
            };
        });

        const { error: milestoneError } = await supabase
            .from("plan_milestones")
            .insert(milestonesToInsert);

        if (milestoneError) {
            console.error("Failed to create milestones:", milestoneError);
            // Optionally delete the plan if milestones fail?
            return { success: false, error: "Failed to create milestones" };
        }

        revalidatePath("/dashboard/plans");
        return { success: true, planId: plan.id };

    } catch (error) {
        console.error("Plan generation error:", error);
        return { success: false, error: "Failed to generate plan" };
    }
}

export async function getActivePlans() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: plans } = await supabase
        .from("study_plans")
        .select(`
            *,
            plan_milestones (
                *
            )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

    // Sort milestones by order_index
    if (plans) {
        plans.forEach(plan => {
            if (plan.plan_milestones) {
                plan.plan_milestones.sort((a: any, b: any) => a.order_index - b.order_index);
            }
        });
    }

    return plans || [];
}

export async function updateMilestoneStatus(milestoneId: string, isCompleted: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    // Verify ownership via RLS policies (implicit in operation if policy exists)
    // But direct update is safest if we assume RLS works
    const { error } = await supabase
        .from("plan_milestones")
        .update({ is_completed: isCompleted })
        .eq("id", milestoneId);

    if (error) {
        console.error("Failed to update milestone:", error);
        return { success: false };
    }

    revalidatePath("/dashboard/plans");
    return { success: true };
}
