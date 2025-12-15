-- ============================================
-- ACE - AI Study Companion Database Schema
-- ============================================

-- ============================================
-- Decks Table
-- ============================================
CREATE TABLE IF NOT EXISTS decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own decks" ON decks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks" ON decks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks" ON decks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks" ON decks
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Cards Table
-- ============================================
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    difficulty_rating INT DEFAULT 3 CHECK (difficulty_rating BETWEEN 1 AND 5),
    last_reviewed TIMESTAMPTZ,
    next_review TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cards in own decks" ON cards
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid())
    );

CREATE POLICY "Users can insert cards in own decks" ON cards
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid())
    );

CREATE POLICY "Users can update cards in own decks" ON cards
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid())
    );

CREATE POLICY "Users can delete cards in own decks" ON cards
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid())
    );

-- ============================================
-- Documents Table (PDF Storage)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_deck_id ON documents(deck_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in own decks" ON documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = documents.deck_id AND decks.user_id = auth.uid())
    );

CREATE POLICY "Users can insert documents in own decks" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = documents.deck_id AND decks.user_id = auth.uid())
    );

CREATE POLICY "Users can update documents in own decks" ON documents
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = documents.deck_id AND decks.user_id = auth.uid())
    );

CREATE POLICY "Users can delete documents in own decks" ON documents
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = documents.deck_id AND decks.user_id = auth.uid())
    );

-- ============================================
-- Quizzes Table (AI Generated Tests)
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    questions JSONB NOT NULL,
    score INT,
    total_questions INT NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_deck_id ON quizzes(deck_id);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage quizzes in own decks" ON quizzes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = quizzes.deck_id AND decks.user_id = auth.uid())
    );

-- ============================================
-- Grade History Table (Past Results)
-- ============================================
CREATE TABLE IF NOT EXISTS grade_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    grade_value TEXT NOT NULL,
    semester TEXT,
    feedback_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grade_history_user_id ON grade_history(user_id);

ALTER TABLE grade_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own grade history" ON grade_history
    FOR ALL USING (auth.uid() = user_id);
