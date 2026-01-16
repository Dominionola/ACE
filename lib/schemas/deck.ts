import { z } from "zod";

// ============================================
// Deck Schemas
// ============================================

export const InsertDeckSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters"),
    description: z
        .string()
        .max(500, "Description must be less than 500 characters")
        .optional(),
    is_public: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
});

export type InsertDeck = z.infer<typeof InsertDeckSchema>;

// ============================================
// Card Schemas
// ============================================

export const InsertCardSchema = z.object({
    deck_id: z.string().uuid("Invalid deck ID"),
    front_content: z
        .string()
        .min(1, "Front content is required")
        .max(2000, "Content is too long"),
    back_content: z
        .string()
        .min(1, "Back content is required")
        .max(2000, "Content is too long"),
    difficulty_rating: z.number().int().min(1).max(5).default(3),
});

export type InsertCard = z.infer<typeof InsertCardSchema>;

// ============================================
// Database Row Types
// ============================================

export interface Deck {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    is_public: boolean;
    tags: string[];
    semester: string | null;
    subject_source: 'manual' | 'grades' | 'goals' | null;
    created_at: string;
    updated_at: string;
}

export interface Card {
    id: string;
    deck_id: string;
    front_content: string;
    back_content: string;
    difficulty_rating: number;
    last_reviewed: string | null;
    next_review: string | null;
    created_at: string;
}

export interface DeckWithCards extends Deck {
    cards: Card[];
}
