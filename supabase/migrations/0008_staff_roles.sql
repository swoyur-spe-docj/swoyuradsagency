-- Team accounts with roles, and order assignment. Safe to run more than once.
create table if not exists public.business_staff (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  name text not null check (char_length(name) between 2 and 80),
  role text not null check (role in ('admin','manager','editor','designer')),
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.business_staff enable row level security;
revoke all on public.business_staff from anon, authenticated;
drop trigger if exists set_updated_at on public.business_staff;
create trigger set_updated_at before update on public.business_staff for each row execute function public.set_business_updated_at();

alter table public.business_orders add column if not exists assigned_to uuid references public.business_staff(id) on delete set null;
create index if not exists business_orders_assigned_to_idx on public.business_orders(assigned_to);
