-- Add Spaced Repetition (SM-2) columns to cards table

-- ease_factor: Multiplier for the interval (default 2.5 per SM-2)
-- interval: Days until next review
-- repetitions: Consecutive correct answers

ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS ease_factor FLOAT DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS interval INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0;

-- Ensure next_review and last_reviewed exist (in case they were missed)
ALTER TABLE public.cards
ADD COLUMN IF NOT EXISTS next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_reviewed TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying of due cards
CREATE INDEX IF NOT EXISTS idx_cards_next_review ON public.cards(next_review);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON public.cards(deck_id);
