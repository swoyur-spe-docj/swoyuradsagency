-- 0012: Packages can show a cover photo and a short video.
alter table public.business_packages
  add column if not exists cover_url text not null default '',
  add column if not exists cover_video_url text not null default '';
