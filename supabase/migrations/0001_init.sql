-- JokiWebApp initial schema.
-- Safe to re-run. Paste into the Supabase SQL editor or run with `supabase db push`.

begin;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (
    category in (
      'Web Development',
      'UI/UX Design',
      'Automation & Bots',
      'Academic Scripts',
      'Database & Backend'
    )
  ),
  description text not null,
  price numeric not null check (price >= 0),
  status text not null check (status in ('SECURE', 'ONLINE', 'ENCRYPTED')),
  image_url text
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_service_id_idx on public.orders (service_id);

-- Guarded alters rather than inline checks, because create table if not exists
-- leaves an existing table unchanged.
do $$
begin
  -- The cap the signup trigger applies, enforced on the column users can write.
  -- NULL stays valid: an account with no username and no email has neither to use.
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'profiles_username_length' and conrelid = 'public.profiles'::regclass
  ) then
    update public.profiles set username = left(username, 64) where char_length(username) > 64;
    alter table public.profiles
      add constraint profiles_username_length check (char_length(username) <= 64);
  end if;

  -- price >= 0 lets NaN and Infinity through, because NaN sorts above every number.
  -- This bound rejects both. A row already holding one makes this fail, on purpose.
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'services_price_finite' and conrelid = 'public.services'::regclass
  ) then
    alter table public.services
      add constraint services_price_finite check (price < 'Infinity');
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profile creation on signup
-- ---------------------------------------------------------------------------

-- Signup must succeed whatever the metadata holds, so non-string usernames are
-- ignored and any failure here is logged instead of raised.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta_username text;
begin
  if jsonb_typeof(new.raw_user_meta_data -> 'username') = 'string' then
    meta_username := nullif(btrim(new.raw_user_meta_data ->> 'username'), '');
  end if;

  insert into public.profiles (id, username, email)
  values (
    new.id,
    left(coalesce(meta_username, nullif(split_part(coalesce(new.email, ''), '@', 1), '')), 64),
    new.email
  )
  on conflict (id) do nothing;

  return new;
exception
  when others then
    raise warning 'handle_new_user failed for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Guarded rather than dropped: DROP TRIGGER needs ownership of auth.users, which
-- belongs to supabase_auth_admin, so a drop could fail on re-runs.
do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_trigger
    where tgname = 'on_auth_user_created' and tgrelid = 'auth.users'::regclass
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end;
$$;

-- Accounts created before this migration never fired the trigger.
insert into public.profiles (id, username, email)
select
  u.id,
  left(
    coalesce(
      case
        when jsonb_typeof(u.raw_user_meta_data -> 'username') = 'string'
          then nullif(btrim(u.raw_user_meta_data ->> 'username'), '')
      end,
      nullif(split_part(coalesce(u.email, ''), '@', 1), '')
    ),
    64
  ),
  u.email
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Public completed counters
-- ---------------------------------------------------------------------------

-- Orders are private, so this exposes aggregates only: no user ids, no order rows.
create or replace function public.service_completed_counts()
returns table (service_id uuid, completed_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select o.service_id, count(*)
  from public.orders o
  where o.status = 'completed'
  group by o.service_id;
$$;

revoke all on function public.service_completed_counts() from public;
grant execute on function public.service_completed_counts() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists services_select_public on public.services;
create policy services_select_public on public.services
  for select to anon, authenticated
  using (true);

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists orders_insert_own_pending on public.orders;
create policy orders_insert_own_pending on public.orders
  for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

-- Supabase's default privileges hand ALL on new tables to anon and authenticated,
-- so clear those first. The column lists below are what stop a user rewriting
-- profiles.id or profiles.email, and backdating orders.created_at.
revoke all on table public.profiles, public.services, public.orders from public, anon, authenticated;

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.profiles to authenticated;
grant update (username) on table public.profiles to authenticated;

grant select on table public.services to anon, authenticated;

grant select on table public.orders to authenticated;
grant insert (user_id, service_id, status) on table public.orders to authenticated;

grant all on table public.profiles, public.services, public.orders to service_role;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime') then
    raise notice 'Publication supabase_realtime not found; skipping realtime setup.';
  elsif not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end;
$$;

commit;
