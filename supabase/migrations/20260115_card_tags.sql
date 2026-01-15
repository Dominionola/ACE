-- Add tags/categories support for cards
-- This allows organizing cards by topic within a deck

-- Add tag column to cards table
ALTER TABLE public.cards
ADD COLUMN IF NOT EXISTS tag VARCHAR(100);

-- Create index for efficient tag-based queries
CREATE INDEX IF NOT EXISTS idx_cards_tag ON public.cards(tag);

-- Optional: Create a tags table if you want predefined tags per deck
CREATE TABLE IF NOT EXISTS public.deck_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT 'blue', -- For UI display
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deck_id, name)
);

-- Enable RLS on deck_tags
ALTER TABLE public.deck_tags ENABLE ROW LEVEL SECURITY;

-- Users can manage tags for their own decks
CREATE POLICY "Users can view own deck tags" ON public.deck_tags
    FOR SELECT USING (
        deck_id IN (SELECT id FROM public.decks WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own deck tags" ON public.deck_tags
    FOR INSERT WITH CHECK (
        deck_id IN (SELECT id FROM public.decks WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own deck tags" ON public.deck_tags
    FOR UPDATE USING (
        deck_id IN (SELECT id FROM public.decks WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete own deck tags" ON public.deck_tags
    FOR DELETE USING (
        deck_id IN (SELECT id FROM public.decks WHERE user_id = auth.uid())
    );
