-- Adds the emerald_growth theme to the allowed theme values.
-- Safe to run more than once.
alter table public.business_settings drop constraint if exists business_settings_theme_check;
alter table public.business_settings
  add constraint business_settings_theme_check
  check (theme in ('corporate_blue', 'emerald_growth', 'slate_dark', 'warm_minimal', 'modern_mono', 'editorial_light'));

-- New settings rows default to the logo theme. Existing saved choices are not changed.
alter table public.business_settings alter column theme set default 'emerald_growth';
