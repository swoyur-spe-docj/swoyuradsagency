-- Persistent business data for the Padmaarc public checkout and admin CRM.
-- Apply after schema.sql and migrations 0003_safety_baseline.sql.
begin;

create sequence if not exists public.business_order_number_seq start with 1;

create table if not exists public.business_settings (
  id smallint primary key default 1 check (id = 1),
  company_name text not null default 'The Padmaarc Advertising',
  address text not null default 'Sitamarhi, Bihar',
  phone text not null default '+91 95234 37987',
  whatsapp text not null default '919523437987',
  email text not null default 'thepadmaarc@gmail.com',
  instagram text not null default '@the_padmaarc',
  facebook text not null default '',
  linkedin text not null default '',
  youtube text not null default '',
  upi_id text not null default '',
  bank_name text not null default '',
  account_holder text not null default '',
  account_number text not null default '',
  ifsc text not null default '',
  theme text not null default 'corporate_blue' check (theme in ('corporate_blue','slate_dark','warm_minimal','modern_mono','editorial_light')),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  duration_months integer not null check (duration_months > 0),
  price numeric(12,2) not null check (price > 0),
  videos integer not null default 0 check (videos >= 0),
  posters integer not null default 0 check (posters >= 0),
  deliverables text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists business_packages_one_featured_idx on public.business_packages(featured) where featured;

create table if not exists public.business_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business text not null default '',
  city text not null default '',
  mobile text not null unique check (mobile ~ '^[0-9]{10}$'),
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  receipt_token uuid not null unique default gen_random_uuid(),
  package_id uuid references public.business_packages(id) on delete set null,
  snapshot jsonb not null,
  price_amount numeric(12,2) not null check (price_amount > 0),
  customer_name text not null,
  customer_mobile text not null check (customer_mobile ~ '^[0-9]{10}$'),
  customer_email text not null default '',
  business text not null,
  city text not null,
  goal text not null default '',
  start_date date,
  gst text not null default '' check (gst = '' or gst ~ '^[0-9A-Z]{15}$'),
  status text not null default 'new' check (status in ('new','contacted','confirmed','paid','active','completed','cancelled')),
  cancel_reason text not null default '',
  notes text not null default '',
  agreement_signed boolean not null default false,
  client_id uuid references public.business_clients(id) on delete set null,
  events jsonb not null default '[]'::jsonb check (jsonb_typeof(events) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists business_orders_created_idx on public.business_orders(created_at desc);
create index if not exists business_orders_status_created_idx on public.business_orders(status, created_at desc);
create index if not exists business_orders_mobile_idx on public.business_orders(customer_mobile);

create table if not exists public.business_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.business_orders(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  method text not null check (method in ('upi','bank_transfer','cash','other')),
  reference text not null default '',
  received_on date not null default current_date,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists business_payments_order_idx on public.business_payments(order_id, received_on desc);
create index if not exists business_payments_received_idx on public.business_payments(received_on desc);

create table if not exists public.business_client_packages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.business_clients(id) on delete cascade,
  order_id uuid not null unique references public.business_orders(id) on delete restrict,
  package_name text not null,
  start_date date not null,
  end_date date not null,
  videos_total integer not null check (videos_total >= 0),
  videos_used integer not null default 0 check (videos_used >= 0 and videos_used <= videos_total),
  posters_total integer not null check (posters_total >= 0),
  posters_used integer not null default 0 check (posters_used >= 0 and posters_used <= posters_total),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists business_client_packages_end_idx on public.business_client_packages(end_date);
create index if not exists business_client_packages_client_idx on public.business_client_packages(client_id);

create table if not exists public.business_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text not null check (mobile ~ '^[0-9]{10}$'),
  message text not null default '',
  email text not null default '',
  business text not null default '',
  budget text not null default '',
  services text[] not null default '{}',
  status text not null default 'new' check (status in ('new','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists business_enquiries_status_created_idx on public.business_enquiries(status, created_at desc);

create table if not exists public.business_meta_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.business_clients(id) on delete cascade,
  campaign text not null,
  start_date date,
  end_date date,
  budget numeric(12,2) not null default 0 check (budget >= 0),
  spend numeric(12,2) not null default 0 check (spend >= 0),
  leads integer not null default 0 check (leads >= 0),
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists business_meta_entries_client_idx on public.business_meta_entries(client_id, start_date desc);

create table if not exists public.business_portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Video','Poster','Influencer','Meta Ads')),
  thumb_url text not null default '',
  video_url text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists business_portfolio_published_sort_idx on public.business_portfolio(published, sort_order);

create table if not exists public.business_media (
  id text primary key,
  label text not null,
  kind text not null check (kind in ('image','video')),
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.business_settings(id) values (1) on conflict (id) do nothing;
insert into public.business_packages(slug,name,duration_months,price,videos,posters,deliverables,featured,active,sort_order) values
 ('starter','Starter',1,30000,4,3,array['4 videos','3 posters','Influencer collaboration','Meta Ads setup'],false,true,1),
 ('growth','Growth',3,70000,12,5,array['12 videos','5 posters','Influencer collaboration','Meta Ads setup'],true,true,2),
 ('premium','Premium',6,120000,20,12,array['20 videos','12 posters','Premium influencer collaboration','Meta Ads setup'],false,true,3)
on conflict (slug) do nothing;
insert into public.business_portfolio(id,title,category,thumb_url,video_url,published,sort_order) values
 ('b98be8bd-8d17-48f4-9af4-e882b0e74e01','Shop launch video','Video','','',false,1),
 ('b98be8bd-8d17-48f4-9af4-e882b0e74e02','Festival offer poster','Poster','','',false,2),
 ('b98be8bd-8d17-48f4-9af4-e882b0e74e03','Local influencer campaign','Influencer','','',false,3),
 ('b98be8bd-8d17-48f4-9af4-e882b0e74e04','Restaurant Meta Ads','Meta Ads','','',false,4)
on conflict (id) do nothing;

create or replace function public.set_business_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp
as $$ begin new.updated_at := now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['business_settings','business_packages','business_clients','business_orders','business_client_packages','business_enquiries','business_portfolio','business_media'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_business_updated_at()', t);
  end loop;
end $$;

create or replace function public.create_business_order(
  p_package_slug text, p_customer_name text, p_customer_mobile text, p_customer_email text,
  p_business text, p_city text, p_goal text, p_start_date date, p_gst text
)
returns table(order_id uuid, order_number text, receipt_token uuid)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare pkg public.business_packages%rowtype; new_number text; new_id uuid; new_token uuid;
begin
  select * into pkg from public.business_packages where slug = p_package_slug and active for share;
  if not found then raise exception 'PACKAGE_UNAVAILABLE'; end if;
  new_number := 'PAD-' || lpad(nextval('public.business_order_number_seq')::text, 4, '0');
  new_id := gen_random_uuid(); new_token := gen_random_uuid();
  insert into public.business_orders(id,order_number,receipt_token,package_id,snapshot,price_amount,customer_name,customer_mobile,customer_email,business,city,goal,start_date,gst,events)
  values (new_id,new_number,new_token,pkg.id,
    jsonb_build_object('name',pkg.name,'price',pkg.price,'videos',pkg.videos,'posters',pkg.posters,'durationMonths',pkg.duration_months,'deliverables',to_jsonb(pkg.deliverables)),
    pkg.price,p_customer_name,p_customer_mobile,coalesce(p_customer_email,''),p_business,p_city,coalesce(p_goal,''),p_start_date,coalesce(p_gst,''),
    jsonb_build_array(jsonb_build_object('at',now(),'text','Order received from website')));
  return query select new_id,new_number,new_token;
end $$;

create or replace function public.set_business_order_status(p_order_id uuid,p_next_status text,p_reason text default '')
returns table(ok boolean,error text)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare current_order public.business_orders%rowtype; allowed boolean := false; clean_reason text := btrim(coalesce(p_reason,''));
begin
  select * into current_order from public.business_orders where id=p_order_id for update;
  if not found then return query select false,'Order not found'::text; return; end if;
  allowed := (current_order.status='new' and p_next_status in ('contacted','cancelled'))
    or (current_order.status='contacted' and p_next_status in ('confirmed','cancelled'))
    or (current_order.status='confirmed' and p_next_status='cancelled')
    or (current_order.status='active' and p_next_status='completed');
  if not allowed then return query select false,format('Cannot move from %s to %s',current_order.status,p_next_status); return; end if;
  if p_next_status='cancelled' and clean_reason='' then return query select false,'A reason is required to cancel an order'::text; return; end if;
  update public.business_orders set status=p_next_status,cancel_reason=case when p_next_status='cancelled' then clean_reason else cancel_reason end,
    events=events || jsonb_build_array(jsonb_build_object('at',now(),'text','Status changed to '||p_next_status||case when clean_reason<>'' then ': '||clean_reason else '' end))
    where id=p_order_id;
  return query select true,''::text;
end $$;

create or replace function public.update_business_order_details(p_order_id uuid,p_notes text,p_agreement_signed boolean)
returns table(ok boolean,error text)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare o public.business_orders%rowtype; next_events jsonb;
begin
  select * into o from public.business_orders where id=p_order_id for update;
  if not found then return query select false,'Order not found'::text; return; end if;
  next_events:=o.events;
  if p_agreement_signed is not null and p_agreement_signed<>o.agreement_signed then
    next_events:=next_events || jsonb_build_array(jsonb_build_object('at',now(),'text',case when p_agreement_signed then 'Agreement marked as signed' else 'Agreement marked as not signed' end));
  end if;
  update public.business_orders set
    notes=coalesce(p_notes,notes),
    agreement_signed=coalesce(p_agreement_signed,agreement_signed),
    events=next_events
    where id=p_order_id;
  return query select true,''::text;
end $$;

create or replace function public.add_business_payment(
  p_order_id uuid,p_amount numeric,p_method text,p_reference text,p_received_on date,p_note text
)
returns table(ok boolean,error text)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare o public.business_orders%rowtype; paid numeric(12,2); next_status text;
begin
  select * into o from public.business_orders where id=p_order_id for update;
  if not found then return query select false,'Order not found'::text; return; end if;
  if o.status<>'confirmed' then return query select false,'Payments can be recorded only after the order is confirmed'::text; return; end if;
  if p_amount is null or p_amount<=0 then return query select false,'Amount must be more than 0'::text; return; end if;
  select coalesce(sum(amount),0) into paid from public.business_payments where order_id=p_order_id;
  if p_amount>o.price_amount-paid then return query select false,'Amount is more than the balance due'::text; return; end if;
  insert into public.business_payments(order_id,amount,method,reference,received_on,note)
  values(p_order_id,p_amount,p_method,coalesce(btrim(p_reference),''),coalesce(p_received_on,current_date),coalesce(btrim(p_note),''));
  next_status := case when paid+p_amount=o.price_amount then 'paid' else o.status end;
  update public.business_orders set status=next_status,
    events=events || jsonb_build_array(jsonb_build_object('at',now(),'text','Payment of ₹'||p_amount||' received ('||p_method||')')) ||
      case when next_status='paid' then jsonb_build_array(jsonb_build_object('at',now(),'text','Full amount received, status set to paid')) else '[]'::jsonb end
    where id=p_order_id;
  return query select true,''::text;
end $$;

create or replace function public.activate_business_order(p_order_id uuid,p_start_date date)
returns table(ok boolean,error text)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare o public.business_orders%rowtype; c public.business_clients%rowtype; s jsonb; months integer; videos integer; posters integer; end_day date;
begin
  select * into o from public.business_orders where id=p_order_id for update;
  if not found then return query select false,'Order not found'::text; return; end if;
  if o.status='active' and o.client_id is not null then return query select true,''::text; return; end if;
  if o.status<>'paid' then return query select false,'Only paid orders can be activated'::text; return; end if;
  if p_start_date is null then return query select false,'Start date is required'::text; return; end if;
  s:=o.snapshot; months:=greatest(1,(s->>'durationMonths')::integer); videos:=greatest(0,(s->>'videos')::integer); posters:=greatest(0,(s->>'posters')::integer);
  end_day := (p_start_date + make_interval(months=>months))::date;
  insert into public.business_clients(name,business,city,mobile,email)
    values(o.customer_name,o.business,o.city,o.customer_mobile,o.customer_email)
    on conflict(mobile) do update set name=excluded.name,business=excluded.business,city=excluded.city,email=excluded.email,updated_at=now()
    returning * into c;
  insert into public.business_client_packages(client_id,order_id,package_name,start_date,end_date,videos_total,posters_total)
    values(c.id,o.id,s->>'name',p_start_date,end_day,videos,posters)
    on conflict(order_id) do nothing;
  update public.business_orders set client_id=c.id,status='active',
    events=events || jsonb_build_array(jsonb_build_object('at',now(),'text','Campaign activated, start '||p_start_date::text))
    where id=o.id;
  return query select true,''::text;
end $$;

create or replace function public.bump_business_quota(p_client_package_id uuid,p_kind text)
returns table(ok boolean,error text)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare cp public.business_client_packages%rowtype;
begin
  select * into cp from public.business_client_packages where id=p_client_package_id for update;
  if not found then return query select false,'Package not found'::text; return; end if;
  if p_kind='video' then
    if cp.videos_used>=cp.videos_total then return query select false,'Video quota is full'::text; return; end if;
    update public.business_client_packages set videos_used=videos_used+1 where id=p_client_package_id;
  elsif p_kind='poster' then
    if cp.posters_used>=cp.posters_total then return query select false,'Poster quota is full'::text; return; end if;
    update public.business_client_packages set posters_used=posters_used+1 where id=p_client_package_id;
  else return query select false,'Unknown quota type'::text; return;
  end if;
  return query select true,''::text;
end $$;

create or replace function public.save_business_package(
  p_id uuid,p_slug text,p_name text,p_duration_months integer,p_price numeric,p_videos integer,p_posters integer,
  p_deliverables text[],p_featured boolean,p_active boolean,p_sort_order integer
)
returns table(ok boolean,error text)
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if btrim(coalesce(p_name,''))='' then return query select false,'Package name is required'::text; return; end if;
  if btrim(coalesce(p_slug,''))='' then return query select false,'Slug is required'::text; return; end if;
  if p_duration_months is null or p_duration_months<1 then return query select false,'Duration must be at least 1 month'::text; return; end if;
  if p_price is null or p_price<=0 then return query select false,'Price must be more than 0'::text; return; end if;
  if exists(select 1 from public.business_packages where slug=p_slug and (p_id is null or id<>p_id)) then return query select false,'Another package already uses this slug'::text; return; end if;
  if p_featured then update public.business_packages set featured=false where featured and (p_id is null or id<>p_id); end if;
  if p_id is null then
    insert into public.business_packages(slug,name,duration_months,price,videos,posters,deliverables,featured,active,sort_order)
    values(btrim(p_slug),btrim(p_name),p_duration_months,p_price,greatest(0,p_videos),greatest(0,p_posters),coalesce(p_deliverables,'{}'),p_featured,p_active,p_sort_order);
  else
    update public.business_packages set slug=btrim(p_slug),name=btrim(p_name),duration_months=p_duration_months,price=p_price,
      videos=greatest(0,p_videos),posters=greatest(0,p_posters),deliverables=coalesce(p_deliverables,'{}'),featured=p_featured,active=p_active,sort_order=p_sort_order
      where id=p_id;
    if not found then return query select false,'Package not found'::text; return; end if;
  end if;
  return query select true,''::text;
end $$;

create or replace function public.delete_business_package(p_id uuid)
returns table(ok boolean,error text)
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if exists(select 1 from public.business_orders where package_id=p_id) then
    update public.business_packages set active=false where id=p_id;
    return query select false,'This package has orders, so it was hidden instead of deleted'::text; return;
  end if;
  delete from public.business_packages where id=p_id;
  if not found then return query select false,'Package not found'::text; return; end if;
  return query select true,''::text;
end $$;

create or replace function public.move_business_portfolio(p_id uuid,p_direction text)
returns void language plpgsql security definer set search_path = public, pg_temp
as $$
declare current_item public.business_portfolio%rowtype; neighbor public.business_portfolio%rowtype;
begin
  select * into current_item from public.business_portfolio where id=p_id for update;
  if not found then return; end if;
  if p_direction='up' then
    select * into neighbor from public.business_portfolio where sort_order<current_item.sort_order order by sort_order desc limit 1 for update;
  elsif p_direction='down' then
    select * into neighbor from public.business_portfolio where sort_order>current_item.sort_order order by sort_order asc limit 1 for update;
  else return;
  end if;
  if neighbor.id is not null then
    update public.business_portfolio set sort_order=neighbor.sort_order where id=current_item.id;
    update public.business_portfolio set sort_order=current_item.sort_order where id=neighbor.id;
  end if;
end $$;

alter table public.business_settings enable row level security;
alter table public.business_packages enable row level security;
alter table public.business_clients enable row level security;
alter table public.business_orders enable row level security;
alter table public.business_payments enable row level security;
alter table public.business_client_packages enable row level security;
alter table public.business_enquiries enable row level security;
alter table public.business_meta_entries enable row level security;
alter table public.business_portfolio enable row level security;
alter table public.business_media enable row level security;

revoke all on public.business_settings,public.business_packages,public.business_clients,public.business_orders,public.business_payments,public.business_client_packages,public.business_enquiries,public.business_meta_entries,public.business_portfolio,public.business_media from public,anon,authenticated;
grant all on public.business_settings,public.business_packages,public.business_clients,public.business_orders,public.business_payments,public.business_client_packages,public.business_enquiries,public.business_meta_entries,public.business_portfolio,public.business_media to service_role;
grant usage,select on sequence public.business_order_number_seq to service_role;

revoke all on function public.create_business_order(text,text,text,text,text,text,text,date,text) from public,anon,authenticated;
revoke all on function public.set_business_order_status(uuid,text,text) from public,anon,authenticated;
revoke all on function public.update_business_order_details(uuid,text,boolean) from public,anon,authenticated;
revoke all on function public.add_business_payment(uuid,numeric,text,text,date,text) from public,anon,authenticated;
revoke all on function public.activate_business_order(uuid,date) from public,anon,authenticated;
revoke all on function public.bump_business_quota(uuid,text) from public,anon,authenticated;
revoke all on function public.save_business_package(uuid,text,text,integer,numeric,integer,integer,text[],boolean,boolean,integer) from public,anon,authenticated;
revoke all on function public.delete_business_package(uuid) from public,anon,authenticated;
revoke all on function public.move_business_portfolio(uuid,text) from public,anon,authenticated;
grant execute on function public.create_business_order(text,text,text,text,text,text,text,date,text) to service_role;
grant execute on function public.set_business_order_status(uuid,text,text) to service_role;
grant execute on function public.update_business_order_details(uuid,text,boolean) to service_role;
grant execute on function public.add_business_payment(uuid,numeric,text,text,date,text) to service_role;
grant execute on function public.activate_business_order(uuid,date) to service_role;
grant execute on function public.bump_business_quota(uuid,text) to service_role;
grant execute on function public.save_business_package(uuid,text,text,integer,numeric,integer,integer,text[],boolean,boolean,integer) to service_role;
grant execute on function public.delete_business_package(uuid) to service_role;
grant execute on function public.move_business_portfolio(uuid,text) to service_role;

commit;
