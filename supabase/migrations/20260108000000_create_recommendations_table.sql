-- Create user_recommendations table
create table if not exists public.user_recommendations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null references public.movies(id) on delete cascade,
  score numeric not null,
  reason jsonb,
  generated_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,

  -- Ensure unique recommendations per user per movie
  unique(user_id, movie_id)
);

-- Add index for faster lookups by user
create index if not exists user_recommendations_user_id_idx on public.user_recommendations(user_id);

-- Add index for faster lookups by score (to get top recommendations)
create index if not exists user_recommendations_user_score_idx on public.user_recommendations(user_id, score desc);

-- Enable RLS
alter table public.user_recommendations enable row level security;

-- Policy: Users can read their own recommendations
create policy "Users can view their own recommendations"
  on public.user_recommendations
  for select
  using (auth.uid() = user_id);

-- Policy: Service role can insert/update recommendations
create policy "Service role can manage recommendations"
  on public.user_recommendations
  for all
  using (auth.role() = 'service_role');

-- Add comment
comment on table public.user_recommendations is 'Stores personalized movie/TV recommendations for users based on their watch history and preferences';
