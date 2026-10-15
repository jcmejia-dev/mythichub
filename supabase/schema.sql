-- Run in Supabase SQL Editor. All game identifiers remain private.
create table if not exists public.player_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 player_id text not null check (player_id ~ '^[0-9]{5,15}$'),
 server_id text not null check (server_id ~ '^[0-9]{3,8}$'),
 nickname text check (char_length(nickname)<=40),
 updated_at timestamptz not null default now()
);
alter table public.player_profiles enable row level security;
create policy "Read own profile" on public.player_profiles for select to authenticated using ((select auth.uid())=user_id);
create policy "Insert own profile" on public.player_profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own profile" on public.player_profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
