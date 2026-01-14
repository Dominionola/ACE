-- Re-runnable migration for Phase 4 Study Plans
-- Includes DROP statements to safely update schema (Tables, Constraints, and Policies)

-- 1. Drop tables to ensure clean slate (removes policies and data)
DROP TABLE IF EXISTS plan_milestones CASCADE;
DROP TABLE IF EXISTS study_plans CASCADE;

-- 2. Create Study Plans Table
CREATE TABLE study_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Plan Milestones Table
CREATE TABLE plan_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date_due TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    resources JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX idx_study_plans_user ON study_plans(user_id);
CREATE INDEX idx_plan_milestones_plan ON plan_milestones(plan_id);

-- 5. Enable RLS
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_milestones ENABLE ROW LEVEL SECURITY;

-- 6. Policies
CREATE POLICY "Users can view their own study plans" ON study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own study plans" ON study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study plans" ON study_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study plans" ON study_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view milestones of their plans" ON plan_milestones FOR SELECT USING (
    EXISTS (SELECT 1 FROM study_plans WHERE study_plans.id = plan_milestones.plan_id AND study_plans.user_id = auth.uid())
);
CREATE POLICY "Users can insert milestones to their plans" ON plan_milestones FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM study_plans WHERE study_plans.id = plan_milestones.plan_id AND study_plans.user_id = auth.uid())
);
CREATE POLICY "Users can update milestones of their plans" ON plan_milestones FOR UPDATE USING (
    EXISTS (SELECT 1 FROM study_plans WHERE study_plans.id = plan_milestones.plan_id AND study_plans.user_id = auth.uid())
);
CREATE POLICY "Users can delete milestones of their plans" ON plan_milestones FOR DELETE USING (
    EXISTS (SELECT 1 FROM study_plans WHERE study_plans.id = plan_milestones.plan_id AND study_plans.user_id = auth.uid())
);
