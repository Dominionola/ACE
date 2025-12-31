-- User Stats: Tracks unified stats for gamification
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_minutes_studied INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_study_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Earned Badges: Which badges a user has
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_code TEXT NOT NULL, -- e.g., 'EARLY_BIRD', 'STREAK_7'
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_code)
);

-- RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
-- Normally updates happen via server actions/triggers, but explicit update policy is good for now.

CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
-- Insert handled by server side logic mostly, but allowing insert for now
CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
