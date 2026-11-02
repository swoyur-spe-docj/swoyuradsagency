-- Case study fields for portfolio items. Safe to run more than once.
alter table public.business_portfolio add column if not exists slug text;
alter table public.business_portfolio add column if not exists client_name text not null default '';
alter table public.business_portfolio add column if not exists challenge text not null default '';
alter table public.business_portfolio add column if not exists solution text not null default '';
alter table public.business_portfolio add column if not exists result text not null default '';
create unique index if not exists business_portfolio_slug_key on public.business_portfolio(slug) where slug is not null;
