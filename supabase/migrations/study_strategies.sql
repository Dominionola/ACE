-- ============================================
-- Study Strategies Table (AI Generated Reports)
-- ============================================
CREATE TABLE IF NOT EXISTS study_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    semester TEXT NOT NULL,
    strategy_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, semester)
);

CREATE INDEX IF NOT EXISTS idx_study_strategies_user_semester ON study_strategies(user_id, semester);

ALTER TABLE study_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own strategies" ON study_strategies
    FOR ALL USING (auth.uid() = user_id);
