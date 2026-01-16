-- Add semester column to decks for grouping
-- This allows decks to be organized by academic period

ALTER TABLE public.decks
ADD COLUMN IF NOT EXISTS semester VARCHAR(100);

-- Index for efficient semester-based queries
CREATE INDEX IF NOT EXISTS idx_decks_semester ON public.decks(semester);

-- Add subject_source column to track if deck was auto-created from grades
ALTER TABLE public.decks
ADD COLUMN IF NOT EXISTS subject_source VARCHAR(50) DEFAULT NULL;
-- Values: 'manual' (user created), 'grades' (from grade logging), 'goals' (from goal setting)
