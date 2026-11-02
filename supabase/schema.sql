-- LEGACY: this file describes an earlier CMS model (projects, posts, leads) and is NOT used by the app.
-- For a new Supabase project, apply supabase/migrations/*.sql in numeric order instead.
-- Padmaarc editorial CMS: role, content, lead, and task data model.
-- Run in a new Supabase project. Policies are enabled before any app writes are allowed.
create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'manager', 'designer', 'editor');
create type public.review_state as enum ('draft', 'pending_review', 'changes_requested', 'approved', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.app_role not null default 'designer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.role_permissions (
  role public.app_role not null,
  module text not null,
  permission text not null,
  primary key (role, module, permission)
);
insert into public.role_permissions(role,module,permission) values
 ('admin','*','*'),
 ('manager','dashboard','read'),('manager','projects','manage'),('manager','portfolio','manage'),
 ('manager','blog','approve'),('manager','services','manage'),('manager','team','read'),('manager','careers','manage'),
 ('manager','leads','manage'),('manager','testimonials','manage'),('manager','tasks','assign'),('manager','analytics','read'),
 ('manager','users','team_manage'),('manager','activity','team_read'),
 ('designer','dashboard','own_tasks'),('designer','projects','assigned_edit'),('designer','portfolio','upload_edit'),('designer','tasks','own'),
 ('editor','dashboard','own_tasks'),('editor','projects','assigned_read'),('editor','blog','write'),('editor','services','copy_edit'),('editor','case_studies','text_edit'),('editor','tasks','own')
on conflict do nothing;

create function public.current_role() returns public.app_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() and active = true $$;
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.current_role() = 'admin', false) $$;
create function public.is_manager_or_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.current_role() in ('admin','manager'), false) $$;

create table public.projects (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  category text not null default 'Digital', summary text not null default '', challenge text not null default '',
  approach text not null default '', results jsonb not null default '[]'::jsonb, cover_url text not null default '',
  status public.review_state not null default 'draft', created_by uuid not null references public.profiles(id),
  reviewed_by uuid references public.profiles(id), published_at timestamptz, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), archived_at timestamptz
);
create table public.project_members (
  project_id uuid references public.projects(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade,
  primary key(project_id,user_id)
);
create table public.portfolio_media (
  id uuid primary key default gen_random_uuid(), project_id uuid references public.projects(id) on delete cascade,
  url text not null, alt_text text not null, media_type text not null check (media_type in ('image','video')),
  sort_order int not null default 0, uploaded_by uuid not null references public.profiles(id), created_at timestamptz not null default now()
);
create table public.posts (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, excerpt text not null default '',
  body jsonb not null default '{}'::jsonb, category text not null default '', tags text[] not null default '{}',
  seo_title text not null default '', seo_description text not null default '', og_image_url text not null default '',
  status public.review_state not null default 'draft', scheduled_at timestamptz, published_at timestamptz,
  author_id uuid not null references public.profiles(id), reviewed_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.services (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, description text not null default '',
  process jsonb not null default '[]'::jsonb, updated_by uuid references public.profiles(id), updated_at timestamptz not null default now()
);
create table public.team_members (
  id uuid primary key default gen_random_uuid(), name text not null, role_title text not null, bio text not null default '',
  photo_url text not null default '', sort_order int not null default 0, published boolean not null default false
);
create table public.jobs (
  id uuid primary key default gen_random_uuid(), title text not null, location text not null default '', description text not null default '',
  active boolean not null default true, created_at timestamptz not null default now()
);
create table public.job_applications (
  id uuid primary key default gen_random_uuid(), job_id uuid references public.jobs(id) on delete set null,
  name text not null, email text not null, resume_url text not null, created_at timestamptz not null default now()
);
create table public.leads (
  id uuid primary key default gen_random_uuid(), name text not null, company text not null default '', email text not null default '',
  phone text not null default '', budget text not null default '', services text[] not null default '{}', details text not null default '',
  deadline date, status text not null default 'new' check (status in ('new','contacted','qualified','closed')),
  notes text not null default '', assigned_to uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.testimonials (
  id uuid primary key default gen_random_uuid(), client_name text not null, company text not null default '', quote text not null,
  logo_url text not null default '', published boolean not null default false, sort_order int not null default 0
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), title text not null, details text not null default '',
  status text not null default 'todo' check(status in ('todo','in_progress','review','done')),
  project_id uuid references public.projects(id) on delete set null, assignee_id uuid references public.profiles(id),
  due_date date, created_by uuid not null references public.profiles(id), created_at timestamptz not null default now()
);
create table public.activity_log (
  id bigint generated always as identity primary key, actor_id uuid references public.profiles(id), action text not null,
  entity text not null, entity_id text not null default '', details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.portfolio_media enable row level security;
alter table public.posts enable row level security;
alter table public.services enable row level security;
alter table public.team_members enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.leads enable row level security;
alter table public.testimonials enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_log enable row level security;

create policy "published projects are public" on public.projects for select using (status = 'published');
create policy "staff read projects" on public.projects for select to authenticated using (
  public.is_manager_or_admin() or created_by = auth.uid() or exists(select 1 from public.project_members pm where pm.project_id=id and pm.user_id=auth.uid())
);
create policy "managers create projects" on public.projects for insert to authenticated with check(public.is_manager_or_admin());
create policy "managers update projects" on public.projects for update to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "admins delete projects" on public.projects for delete to authenticated using(public.is_admin());
create policy "assigned designers edit projects" on public.projects for update to authenticated using (
  public.current_role()='designer' and exists(select 1 from public.project_members pm where pm.project_id=id and pm.user_id=auth.uid())
) with check(public.current_role()='designer' and status <> 'published');
create policy "published posts are public" on public.posts for select using(status='published' and published_at <= now());
create policy "authors read posts" on public.posts for select to authenticated using(public.is_manager_or_admin() or author_id=auth.uid());
create policy "authors manage own drafts" on public.posts for all to authenticated using(
  public.current_role()='editor' and author_id=auth.uid() and status <> 'published'
) with check(public.current_role()='editor' and author_id=auth.uid() and status <> 'published');
create policy "managers approve posts" on public.posts for update to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "public read services" on public.services for select using(true);
create policy "editors edit service copy" on public.services for update to authenticated using(public.current_role()='editor') with check(public.current_role()='editor');
create policy "managers manage services" on public.services for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "public read team" on public.team_members for select using(published);
create policy "managers manage team" on public.team_members for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "public read active jobs" on public.jobs for select using(active);
create policy "managers manage jobs" on public.jobs for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "public apply to jobs" on public.job_applications for insert with check(true);
create policy "managers read applications" on public.job_applications for select to authenticated using(public.is_manager_or_admin());
create policy "public create leads" on public.leads for insert with check(true);
create policy "staff manage leads" on public.leads for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "public read testimonials" on public.testimonials for select using(published);
create policy "managers manage testimonials" on public.testimonials for all to authenticated using(public.is_manager_or_admin()) with check(public.is_manager_or_admin());
create policy "assigned users read tasks" on public.tasks for select to authenticated using(assignee_id=auth.uid() or public.is_manager_or_admin());
create policy "managers assign tasks" on public.tasks for insert to authenticated with check(public.is_manager_or_admin());
create policy "assignees update own tasks" on public.tasks for update to authenticated using(assignee_id=auth.uid() or public.is_manager_or_admin()) with check(assignee_id=auth.uid() or public.is_manager_or_admin());
create policy "admins read all profiles" on public.profiles for select to authenticated using(public.is_admin());
create policy "managers read designers and editors" on public.profiles for select to authenticated using(public.current_role()='manager' and role in ('designer','editor'));
create policy "users read own profile" on public.profiles for select to authenticated using(id=auth.uid());
create policy "admins manage profiles" on public.profiles for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "managers add designers and editors" on public.profiles for insert to authenticated with check(public.current_role()='manager' and role in ('designer','editor'));
create policy "managers deactivate designers and editors" on public.profiles for update to authenticated using(public.current_role()='manager' and role in ('designer','editor')) with check(public.current_role()='manager' and role in ('designer','editor'));
create policy "read role permissions" on public.role_permissions for select to authenticated using(true);
create policy "admins manage role permissions" on public.role_permissions for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "public read published media" on public.portfolio_media for select using(exists(select 1 from public.projects p where p.id=project_id and p.status='published'));
create policy "staff manage assigned media" on public.portfolio_media for all to authenticated using(
 public.is_manager_or_admin() or (public.current_role()='designer' and exists(select 1 from public.project_members pm where pm.project_id=portfolio_media.project_id and pm.user_id=auth.uid()))
) with check(public.is_manager_or_admin() or (public.current_role()='designer' and exists(select 1 from public.project_members pm where pm.project_id=portfolio_media.project_id and pm.user_id=auth.uid())));
create policy "admins read audit log" on public.activity_log for select to authenticated using(public.is_admin());
create policy "managers read team audit log" on public.activity_log for select to authenticated using(public.current_role()='manager' and exists(
 select 1 from public.profiles p where p.id=actor_id and p.role in ('designer','editor')
));
create policy "authenticated audit inserts" on public.activity_log for insert to authenticated with check(actor_id=auth.uid());
