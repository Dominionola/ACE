-- Create quizzes table
create table public.quizzes (
  id uuid not null default gen_random_uuid (),
  deck_id uuid not null references public.decks (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  created_at timestamp with time zone not null default now(),
  constraint quizzes_pkey primary key (id)
);

-- Enable RLS
alter table public.quizzes enable row level security;

-- Policies
create policy "Users can view their own quizzes" on public.quizzes
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own quizzes" on public.quizzes
  for insert
  with check (auth.uid() = user_id);
