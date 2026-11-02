-- 0011: The site has two themes only (corporate_blue = orange, emerald_growth = green).
-- Rows saved with a retired theme are moved to the default so the check constraint can be tightened.
update public.business_settings
  set theme = 'corporate_blue'
  where theme not in ('corporate_blue', 'emerald_growth');

alter table public.business_settings drop constraint if exists business_settings_theme_check;
alter table public.business_settings
  add constraint business_settings_theme_check
  check (theme in ('corporate_blue', 'emerald_growth'));
