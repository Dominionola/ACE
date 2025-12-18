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

-- ============================================
-- Subject Goals Table (Target Grades)
-- ============================================
CREATE TABLE IF NOT EXISTS subject_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    target_grade TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, subject_name)
);

CREATE INDEX IF NOT EXISTS idx_subject_goals_user_id ON subject_goals(user_id);

ALTER TABLE subject_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subject goals" ON subject_goals
    FOR ALL USING (auth.uid() = user_id);
