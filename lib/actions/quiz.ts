"use server";

import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { InsertQuizResultSchema, QuizSchema } from "@/lib/schemas/quiz";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Config Schema
const QuizConfigSchema = z.object({
    questionCount: z.number().min(1).max(20).default(5),
    topic: z.string().optional(),
});

export async function generateQuiz(documentId: string, config: { questionCount: number; topic?: string } = { questionCount: 5 }) {
    const supabase = await createClient();

    // 1. Auth & Ownership Check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Rate Limit Check
    const { checkRateLimit, AI_RATE_LIMIT } = await import("@/lib/rate-limit");
    const rateCheck = checkRateLimit(`quiz:${user.id}`, AI_RATE_LIMIT);
    if (!rateCheck.success) {
        return { success: false, error: `Rate limit exceeded. Try again in ${Math.ceil(rateCheck.resetIn / 60000)} minutes.` };
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

    const { questionCount, topic } = config;
    const topicInstruction = topic
        ? `Focus specifically on the topic or section: "${topic}". Only generate questions related to this.`
        : "Cover the most important concepts from the entire text.";

    // 3. Generate Quiz with Gemini
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: QuizSchema,
            prompt: `You are a strict teacher. Generate a challenging multiple-choice quiz based on the following text.
          
          Requirements:
          - Generate exactly ${questionCount} questions.
          - 4 options per question.
          - 'correctAnswer' must be the index (0-3) of the correct option.
          - 'explanation': A brief sentence explaining WHY the correct answer is right (Grounding).
          - ${topicInstruction}
          
          Text:
          ${document.extracted_text.slice(0, 30000)}`, // Context limit
        });

        return { success: true, quiz: object };
    } catch (error) {
        console.error("Quiz generation error:", error);
        return { success: false, error: "Failed to generate quiz. Please try again." };
    }
}

// Analysis Schema
const QuizAnalysisInputSchema = z.object({
    questions: z.array(z.object({
        question: z.string(),
        selectedOption: z.string(),
        correctOption: z.string(),
        isCorrect: z.boolean(),
    })),
});

const PerformanceReportSchema = z.object({
    keyWeakness: z.string(),
    recommendation: z.string(),
    motivation: z.string(),
});

export async function analyzeQuizPerformance(input: unknown) {
    const result = QuizAnalysisInputSchema.safeParse(input);
    if (!result.success) {
        console.error("Analysis validation failed", result.error);
        return { success: false, error: "Invalid analysis input" };
    }

    const { questions } = result.data;
    const incorrectCount = questions.filter(q => !q.isCorrect).length;

    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: PerformanceReportSchema,
            prompt: `Analyze this student's quiz performance.
      
      Data:
      ${JSON.stringify(questions, null, 2)}
      
      Task:
      - Identify the main concept they struggled with (if any).
      - Provide a specific study recommendation based on the mistakes.
      - Give a short motivating message.
      - If they got everything right, congratulate them on mastering the topic.
      `,
        });

        return { success: true, report: object };
    } catch (error) {
        console.error("Analysis error:", error);
        return { success: false, error: "Failed to analyze performance." };
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
            score,
            total_questions,
            user_id: user.id,
        });

    if (error) {
        console.error("Save quiz error:", error);
        return { success: false, error: "Failed to save result" };
    }

    revalidatePath(`/dashboard/decks/${deck_id}`);
    return { success: true };
}
