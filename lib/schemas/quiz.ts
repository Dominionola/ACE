import { z } from "zod";

export const QuizQuestionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.number().min(0).max(3),
    explanation: z.string(),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizSchema = z.array(QuizQuestionSchema);

export type Quiz = z.infer<typeof QuizSchema>;

export const InsertQuizResultSchema = z.object({
    deck_id: z.string().uuid(),
    score: z.number().int().min(0),
    total_questions: z.number().int().min(1),
});

export type InsertQuizResult = z.infer<typeof InsertQuizResultSchema>;
