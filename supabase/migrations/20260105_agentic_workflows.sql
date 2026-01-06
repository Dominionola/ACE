-- Drop tables if they exist to ensure clean creation with correct schema
DROP TABLE IF EXISTS study_sessions CASCADE;
DROP TABLE IF EXISTS learning_insights CASCADE;
DROP TABLE IF EXISTS coaching_prompts CASCADE;

-- Study Sessions Table
-- Tracks active and completed study session workflows

CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workflow_type TEXT NOT NULL DEFAULT 'study_session', -- Type of workflow
    current_stage TEXT NOT NULL DEFAULT 'browse', -- Current stage in workflow
    session_state JSONB DEFAULT '{}', -- Persistent state object
    topics_covered TEXT[] DEFAULT '{}', -- Topics studied in this session
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    total_duration_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Insights Table
-- AI-derived insights about the learner

CREATE TABLE IF NOT EXISTS learning_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('strength', 'weakness', 'pattern', 'recommendation')),
    insight_data JSONB NOT NULL, -- Structured insight data
    confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1), -- AI confidence in this insight (0-1)
    valid_until TIMESTAMPTZ, -- When this insight should be re-evaluated
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coaching Prompts Table
-- Proactive coaching messages for users

CREATE TABLE IF NOT EXISTS coaching_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prompt_type TEXT NOT NULL, -- 'exam_reminder', 'break_reminder', 'streak_at_risk', etc.
    prompt_message TEXT NOT NULL,
    prompt_data JSONB DEFAULT '{}', -- Additional context
    shown_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    acted_on BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_active ON study_sessions(user_id, completed_at) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learning_insights_user_subject ON learning_insights(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_coaching_prompts_user_pending ON coaching_prompts(user_id, shown_at) WHERE shown_at IS NULL;

-- Enable RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_sessions
CREATE POLICY "Users can view their own study sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own study sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study sessions" ON study_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for learning_insights
CREATE POLICY "Users can view their own learning insights" ON learning_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own learning insights" ON learning_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own learning insights" ON learning_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own learning insights" ON learning_insights FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for coaching_prompts
CREATE POLICY "Users can view their own coaching prompts" ON coaching_prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own coaching prompts" ON coaching_prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own coaching prompts" ON coaching_prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own coaching prompts" ON coaching_prompts FOR DELETE USING (auth.uid() = user_id);
