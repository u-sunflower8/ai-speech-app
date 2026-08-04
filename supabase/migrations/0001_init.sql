-- Phase 1: profiles, diagnoses, audio-recordings storage bucket

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Auto-create a profile row whenever a new auth user signs up.
-- SECURITY DEFINER is required here (trigger must bypass RLS to insert),
-- but the function's return type (trigger) means Postgres only allows it
-- to run as a trigger, not as a callable public RPC.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- updated_at helper (SECURITY INVOKER by default, runs under caller's RLS)
-- ============================================================
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- diagnoses
-- ============================================================
create table public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  audio_path text,
  audio_duration numeric,
  speaking_duration numeric,
  transcript text,
  character_count integer,
  characters_per_minute numeric,
  total_pause_count integer,
  average_pause_duration numeric,
  longest_pause_duration numeric,
  filler_count integer,
  filler_details jsonb,
  overall_score integer,
  score_details jsonb,
  strengths jsonb,
  improvements jsonb,
  practice_tips jsonb,
  ai_summary text,
  structure_analysis jsonb,
  prompt_version text,
  model_name text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diagnoses_user_id_created_at_idx
  on public.diagnoses (user_id, created_at desc);

alter table public.diagnoses enable row level security;

create policy "diagnoses_select_own"
  on public.diagnoses for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "diagnoses_insert_own"
  on public.diagnoses for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "diagnoses_update_own"
  on public.diagnoses for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "diagnoses_delete_own"
  on public.diagnoses for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create trigger diagnoses_set_updated_at
  before update on public.diagnoses
  for each row execute function public.set_updated_at();

-- ============================================================
-- Storage: audio-recordings bucket (private)
-- Path convention: {user_id}/{diagnosis_id}.{ext}
-- ============================================================
insert into storage.buckets (id, name, public)
values ('audio-recordings', 'audio-recordings', false)
on conflict (id) do nothing;

create policy "audio_recordings_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'audio-recordings'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "audio_recordings_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'audio-recordings'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "audio_recordings_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'audio-recordings'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
