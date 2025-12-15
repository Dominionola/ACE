import { z } from "zod";

// ============================================
// Document Schemas
// ============================================

export const InsertDocumentSchema = z.object({
    deck_id: z.string().uuid("Invalid deck ID"),
    file_name: z.string().min(1, "File name is required"),
    file_url: z.string().url("Invalid file URL"),
    extracted_text: z.string().optional(),
});

export type InsertDocument = z.infer<typeof InsertDocumentSchema>;

// ============================================
// Database Row Types
// ============================================

export interface Document {
    id: string;
    deck_id: string;
    file_name: string;
    file_url: string;
    extracted_text: string | null;
    created_at: string;
}
