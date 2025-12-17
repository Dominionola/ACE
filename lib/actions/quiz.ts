"use server";

import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { InsertQuizResultSchema, QuizSchema } from "@/lib/schemas/quiz";
import { revalidatePath } from "next/cache";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function generateQuiz(documentId: string) {
    const supabase = await createClient();

    // 1. Auth & Ownership Check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // 2. Fetch Document Content
    const { data: document, error: docError } = await supabase
        .from("documents")
        .select("extracted_text, file_name")
        .eq("id", documentId)
        .single();

    if (docError || !document || !document.extracted_text) {
        return { success: false, error: "Document not found or has no text content." };
    }

    // 3. Generate Quiz with Gemini
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: QuizSchema,
            prompt: `You are a strict teacher. Generate a challenging multiple-choice quiz based on the following text.
          
          Requirements:
          - Generate exactly 5 questions.
          - 4 options per question.
          - 'correctAnswer' must be the index (0-3) of the correct option.
          - Focus on key concepts and understanding, not minor details.
          
          Text:
          ${document.extracted_text.slice(0, 30000)}`, // Context limit
        });

        return { success: true, quiz: object };
    } catch (error) {
        console.error("Quiz generation error:", error);
        return { success: false, error: "Failed to generate quiz. Please try again." };
    }
}

export async function saveQuizResult(input: unknown) {
    const result = InsertQuizResultSchema.safeParse(input);
    if (!result.success) {
        return { success: false, error: "Invalid input" };
    }

    const { deck_id, score, total_questions } = result.data;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Insert into quizzes table
    const { error } = await supabase
        .from("quizzes")
        .insert({
            deck_id,
            score, // Storing raw score for now, logic can adapt if schema changes
            // created_at is usually default now()
        });

    if (error) {
        console.error("Save quiz error:", error);
        return { success: false, error: "Failed to save result" };
    }

    revalidatePath(`/dashboard/decks/${deck_id}`);
    return { success: true };
}
