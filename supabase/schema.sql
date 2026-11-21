-- Rode este arquivo inteiro no Supabase: SQL Editor → New query → Run

create table if not exists public.records (
  id         uuid primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('time','report','person','visit','territory','plan')),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists records_user_kind_idx on public.records (user_id, kind);

create table if not exists public.settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data    jsonb not null default '{}'::jsonb
);

alter table public.records  enable row level security;
alter table public.settings enable row level security;

-- cada usuário só enxerga e altera as próprias linhas
drop policy if exists "records_own"  on public.records;
drop policy if exists "settings_own" on public.settings;
create policy "records_own"  on public.records  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "settings_own" on public.settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
