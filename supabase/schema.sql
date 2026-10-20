-- BitePal schema for Supabase (free tier Postgres).
-- Run this in the Supabase SQL Editor for your project.

create extension if not exists "uuid-ossp";

-- Per-user daily targets + profile info.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  calorie_target int not null default 2000,
  protein_target int not null default 120,
  carbs_target int not null default 225,
  fat_target int not null default 65,
  water_target_ml int not null default 2000,
  created_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  portion text not null default '',
  calories int not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  image_url text,
  source text not null default 'manual' check (source in ('scan', 'text', 'manual')),
  logged_at timestamptz not null default now()
);

create table if not exists public.weight_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight_kg numeric not null,
  logged_at timestamptz not null default now()
);

create table if not exists public.water_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_ml int not null,
  logged_at timestamptz not null default now()
);

create table if not exists public.fasting_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  schedule text not null default '16:8',
  fast_hours numeric not null default 16,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  ended_at timestamptz
);

-- Indexes for the common "today" / "history" queries.
create index if not exists meals_user_logged_idx on public.meals (user_id, logged_at desc);
create index if not exists weight_user_logged_idx on public.weight_logs (user_id, logged_at desc);
create index if not exists water_user_logged_idx on public.water_logs (user_id, logged_at desc);
create index if not exists fasting_user_started_idx on public.fasting_sessions (user_id, started_at desc);

-- Row Level Security: every table is private to its owning user.
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.weight_logs enable row level security;
alter table public.water_logs enable row level security;
alter table public.fasting_sessions enable row level security;

create policy "Profiles are self-access" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Meals are self-access" on public.meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Weight logs are self-access" on public.weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Water logs are self-access" on public.water_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Fasting sessions are self-access" on public.fasting_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row with defaults whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket for food photo snippets (create via dashboard or this call).
insert into storage.buckets (id, name, public)
values ('food-photos', 'food-photos', true)
on conflict (id) do nothing;

create policy "Food photos are publicly readable" on storage.objects
  for select using (bucket_id = 'food-photos');

create policy "Users upload their own food photos" on storage.objects
  for insert with check (
    bucket_id = 'food-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );
