-- Create a table for Weekly AI Reports.
create table weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  week_start date not null,
  week_number int not null,
  
  -- Stats Snapshot
  total_minutes int default 0,
  xp_earned int default 0,
  sessions_completed int default 0,
  
  -- AI Content (JSON for flexibility)
  -- Expected structure:
  -- {
  --   "summary": "You had a great week...",
  --   "highlights": ["3 day streak", "Mastered Calculus"],
  --   "focus_next_week": ["Review Physics Ch 3", "More practice on Algebra"],
  --   "grade_trend": "Improving"
  -- }
  report_content jsonb not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table weekly_reports enable row level security;

-- Policies
create policy "Users can view their own reports"
  on weekly_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reports"
  on weekly_reports for insert
  with check (auth.uid() = user_id);
  
-- Index for fast lookup by week
create index idx_weekly_reports_user_week on weekly_reports(user_id, week_number, week_start);
