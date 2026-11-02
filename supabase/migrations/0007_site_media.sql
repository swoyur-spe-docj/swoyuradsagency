-- Site media: public storage bucket for uploaded images and videos,
-- plus columns for poster images and admin-added (custom) media. Safe to run more than once.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 104857600,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.business_media add column if not exists poster_url text not null default '';
alter table public.business_media add column if not exists is_custom boolean not null default false;
