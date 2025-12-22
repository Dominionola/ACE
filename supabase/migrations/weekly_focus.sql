-- Add weekly_focus column to study_strategies table
ALTER TABLE study_strategies
ADD COLUMN IF NOT EXISTS weekly_focus JSONB DEFAULT '[]';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_study_strategies_weekly_focus 
ON study_strategies USING GIN (weekly_focus);
