-- Study Sessions Table: Track actual study time
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    study_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date 
ON study_sessions(user_id, study_date);

-- Exams Table: Track upcoming exams
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    exam_date DATE NOT NULL,
    exam_type TEXT DEFAULT 'Final', -- Final, Midterm, Quiz, etc.
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_exams_user_date 
ON exams(user_id, exam_date);

-- RLS Policies
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions"
ON study_sessions FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exams"
ON exams FOR ALL
USING (auth.uid() = user_id);
