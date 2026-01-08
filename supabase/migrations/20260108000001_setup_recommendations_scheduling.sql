-- Enable pg_cron extension
create extension if not exists pg_cron with schema extensions;

-- Enable http extension for calling edge functions
create extension if not exists http with schema extensions;

-- Create a table to track when recommendations were last generated for each user
create table if not exists public.user_recommendation_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_generated_at timestamp with time zone,
  next_scheduled_at timestamp with time zone,
  is_processing boolean default false,
  error_message text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.user_recommendation_status enable row level security;

-- Policy: Users can read their own status
create policy "Users can view their own recommendation status"
  on public.user_recommendation_status
  for select
  using (auth.uid() = user_id);

-- Policy: Service role can manage status
create policy "Service role can manage recommendation status"
  on public.user_recommendation_status
  for all
  using (auth.role() = 'service_role');

-- Create function to generate recommendations for a single user
create or replace function public.generate_recommendations_for_user(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_result jsonb;
  v_service_role_key text;
  v_supabase_url text;
  v_response http_response;
begin
  -- Get environment variables (these need to be set in Supabase vault or as database settings)
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  if v_supabase_url is null or v_service_role_key is null then
    raise exception 'Missing required configuration: supabase_url or service_role_key';
  end if;

  -- Mark as processing
  insert into public.user_recommendation_status (user_id, is_processing)
  values (p_user_id, true)
  on conflict (user_id)
  do update set
    is_processing = true,
    error_message = null,
    updated_at = now();

  -- Call the edge function using the http extension
  select * into v_response from http((
    'POST',
    v_supabase_url || '/functions/v1/generate_recommendations',
    array[
      http_header('Authorization', 'Bearer ' || v_service_role_key),
      http_header('Content-Type', 'application/json'),
      http_header('x-user-id', p_user_id::text)
    ],
    'application/json',
    '{}'
  )::http_request);

  -- Check response status
  if v_response.status between 200 and 299 then
    v_result := v_response.content::jsonb;

    -- Update status as successful
    update public.user_recommendation_status
    set
      last_generated_at = now(),
      next_scheduled_at = now() + interval '1 day',
      is_processing = false,
      error_message = null,
      updated_at = now()
    where user_id = p_user_id;

    return jsonb_build_object(
      'success', true,
      'user_id', p_user_id,
      'result', v_result
    );
  else
    -- Update status with error
    update public.user_recommendation_status
    set
      is_processing = false,
      error_message = 'HTTP ' || v_response.status || ': ' || v_response.content,
      updated_at = now()
    where user_id = p_user_id;

    return jsonb_build_object(
      'success', false,
      'user_id', p_user_id,
      'error', 'HTTP ' || v_response.status || ': ' || v_response.content
    );
  end if;

exception when others then
  -- Update status with error
  update public.user_recommendation_status
  set
    is_processing = false,
    error_message = SQLERRM,
    updated_at = now()
  where user_id = p_user_id;

  return jsonb_build_object(
    'success', false,
    'user_id', p_user_id,
    'error', SQLERRM
  );
end;
$$;

-- Create function to process all eligible users
create or replace function public.process_scheduled_recommendations()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user record;
  v_results jsonb := '[]'::jsonb;
  v_result jsonb;
  v_processed_count int := 0;
  v_error_count int := 0;
begin
  -- Find users who:
  -- 1. Have never had recommendations generated, OR
  -- 2. Their next_scheduled_at is in the past, OR
  -- 3. Haven't been generated in the last 24 hours
  -- AND are not currently being processed
  for v_user in (
    select distinct mu.user_id
    from public.movies_users mu
    where mu.watched = true
      and mu.rating >= 4
      and not exists (
        select 1
        from public.user_recommendation_status urs
        where urs.user_id = mu.user_id
          and urs.is_processing = true
      )
      and (
        not exists (
          select 1
          from public.user_recommendation_status urs
          where urs.user_id = mu.user_id
        )
        or exists (
          select 1
          from public.user_recommendation_status urs
          where urs.user_id = mu.user_id
            and (
              urs.next_scheduled_at is null
              or urs.next_scheduled_at <= now()
              or urs.last_generated_at is null
              or urs.last_generated_at < now() - interval '24 hours'
            )
        )
      )
    limit 10  -- Process max 10 users per batch to avoid long-running transactions
  ) loop
    -- Generate recommendations for this user
    v_result := public.generate_recommendations_for_user(v_user.user_id);

    -- Accumulate results
    v_results := v_results || jsonb_build_array(v_result);

    if (v_result->>'success')::boolean then
      v_processed_count := v_processed_count + 1;
    else
      v_error_count := v_error_count + 1;
    end if;

    -- Small delay to avoid overwhelming the edge function
    perform pg_sleep(0.5);
  end loop;

  return jsonb_build_object(
    'processed_count', v_processed_count,
    'error_count', v_error_count,
    'total_count', v_processed_count + v_error_count,
    'timestamp', now(),
    'results', v_results
  );
end;
$$;

-- Schedule the job to run every hour
-- This will process up to 10 users per hour who are eligible for recommendations
select cron.schedule(
  'generate-user-recommendations-hourly',
  '0 * * * *',  -- Run at the start of every hour
  $$select public.process_scheduled_recommendations();$$
);

-- Add helpful comment
comment on function public.generate_recommendations_for_user(uuid) is
  'Generates recommendations for a specific user by calling the edge function';

comment on function public.process_scheduled_recommendations() is
  'Processes scheduled recommendation generation for eligible users (max 10 per batch)';

comment on table public.user_recommendation_status is
  'Tracks when recommendations were last generated for each user and scheduling information';
