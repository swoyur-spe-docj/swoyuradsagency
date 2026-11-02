-- Safety baseline for the existing CMS schema. Apply schema.sql first.
-- Every public table gets both audit timestamps; existing rows are backfilled with now().
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','role_permissions','projects','project_members','portfolio_media','posts','services',
    'team_members','jobs','job_applications','leads','testimonials','tasks','activity_log'
  ] loop
    execute format('alter table public.%I add column if not exists created_at timestamptz not null default now()', t);
    execute format('alter table public.%I add column if not exists updated_at timestamptz not null default now()', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at := now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','role_permissions','projects','project_members','portfolio_media','posts','services',
    'team_members','jobs','job_applications','leads','testimonials','tasks','activity_log'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Add an index for every foreign key, including any composite foreign keys added later.
do $$
declare fk record; col_list text; idx_name text;
begin
  for fk in
    select c.conrelid::regclass as table_name, c.conname as constraint_name, c.conkey
    from pg_constraint c
    join pg_namespace n on n.oid = (select relnamespace from pg_class where oid = c.conrelid)
    where c.contype = 'f' and n.nspname = 'public'
  loop
    select string_agg(quote_ident(a.attname), ', ' order by k.ordinality)
      into col_list
      from unnest(fk.conkey) with ordinality as k(attnum, ordinality)
      join pg_attribute a on a.attrelid = fk.table_name and a.attnum = k.attnum;
    idx_name := left(regexp_replace(fk.table_name::text || '_' || fk.constraint_name || '_idx', '[^a-zA-Z0-9_]', '_', 'g'), 63);
    execute format('create index if not exists %I on %s (%s)', idx_name, fk.table_name, col_list);
  end loop;
end $$;

create index if not exists profiles_role_active_idx on public.profiles(role, active);
create index if not exists projects_status_created_idx on public.projects(status, created_at desc);
create index if not exists projects_published_at_idx on public.projects(published_at desc) where published_at is not null;
create index if not exists project_members_user_idx on public.project_members(user_id);
create index if not exists portfolio_media_project_sort_idx on public.portfolio_media(project_id, sort_order);
create index if not exists posts_status_scheduled_idx on public.posts(status, scheduled_at);
create index if not exists posts_published_at_idx on public.posts(published_at desc) where published_at is not null;
create index if not exists team_members_published_sort_idx on public.team_members(published, sort_order);
create index if not exists jobs_active_created_idx on public.jobs(active, created_at desc);
create index if not exists job_applications_created_idx on public.job_applications(created_at desc);
create index if not exists leads_status_created_idx on public.leads(status, created_at desc);
create index if not exists leads_assigned_status_idx on public.leads(assigned_to, status);
create index if not exists testimonials_published_sort_idx on public.testimonials(published, sort_order);
create index if not exists tasks_status_due_idx on public.tasks(status, due_date);
create index if not exists tasks_assignee_due_idx on public.tasks(assignee_id, due_date);
create index if not exists activity_log_created_idx on public.activity_log(created_at desc);
create index if not exists activity_log_actor_created_idx on public.activity_log(actor_id, created_at desc);
create index if not exists activity_log_entity_idx on public.activity_log(entity, entity_id);

create table if not exists public.rate_limits (
  key_hash text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  hits integer not null check (hits > 0),
  window_started_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.rate_limits enable row level security;
drop trigger if exists set_updated_at on public.rate_limits;
create trigger set_updated_at before update on public.rate_limits for each row execute function public.set_updated_at();

create or replace function public.consume_rate_limit(p_key_hash text, p_limit integer, p_window_seconds integer)
returns table(allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql security definer set search_path = public
as $$
declare
  max_hits integer := greatest(1, least(coalesce(p_limit, 1), 10000));
  window_size integer := greatest(1, least(coalesce(p_window_seconds, 1), 2592000));
  hit_count integer;
  window_start timestamptz;
begin
  if p_key_hash !~ '^[0-9a-f]{64}$' then raise exception 'Invalid rate limit key'; end if;
  -- Opportunistic pruning prevents one row per historical IP/scope from accumulating forever.
  if random() < 0.005 then
    delete from public.rate_limits where window_started_at < now() - interval '7 days';
  end if;
  insert into public.rate_limits(key_hash, hits, window_started_at)
    values (p_key_hash, 1, now())
  on conflict (key_hash) do update set
    hits = case
      when public.rate_limits.window_started_at + make_interval(secs => window_size) <= now() then 1
      else public.rate_limits.hits + 1
    end,
    window_started_at = case
      when public.rate_limits.window_started_at + make_interval(secs => window_size) <= now() then now()
      else public.rate_limits.window_started_at
    end,
    updated_at = now()
  returning public.rate_limits.hits, public.rate_limits.window_started_at into hit_count, window_start;
  return query select hit_count <= max_hits, greatest(0, max_hits - hit_count), window_start + make_interval(secs => window_size);
end $$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
revoke all on table public.rate_limits from public, anon, authenticated;
grant all on table public.rate_limits to service_role;
