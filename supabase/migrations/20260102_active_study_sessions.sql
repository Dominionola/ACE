-- Active Study Sessions Table
-- Stores the current timer state for each user to enable session recovery

CREATE TABLE IF NOT EXISTS active_study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    mode TEXT NOT NULL CHECK (mode IN ('focus', 'break')),
    time_remaining INTEGER NOT NULL, -- seconds remaining
    sessions_completed INTEGER DEFAULT 0,
    focus_duration INTEGER DEFAULT 25, -- minutes
    break_duration INTEGER DEFAULT 5, -- minutes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_active_study_sessions_user_id ON active_study_sessions(user_id);

-- Enable RLS
ALTER TABLE active_study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own active sessions"
    ON active_study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own active sessions"
    ON active_study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active sessions"
    ON active_study_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own active sessions"
    ON active_study_sessions FOR DELETE
    USING (auth.uid() = user_id);
