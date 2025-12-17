import { z } from "zod";

export const GradeHistorySchema = z.object({
    subject_name: z.string().min(1, "Subject name is required"),
    grade_value: z.string().min(1, "Grade is required"), // Keeping as string to support "A", "90", "3.5", etc.
    semester: z.string().min(1, "Semester is required"),
});

export type GradeHistoryInput = z.infer<typeof GradeHistorySchema>;

// For DB insertion (includes user_id)
export const InsertGradeHistorySchema = GradeHistorySchema.extend({
    user_id: z.string().uuid(),
});

export const SubjectGoalSchema = z.object({
    subject_name: z.string().min(1, "Subject name is required"),
    target_grade: z.string().min(1, "Target grade is required"),
});

export type SubjectGoalInput = z.infer<typeof SubjectGoalSchema>;

export const InsertSubjectGoalSchema = SubjectGoalSchema.extend({
    user_id: z.string().uuid(),
});
