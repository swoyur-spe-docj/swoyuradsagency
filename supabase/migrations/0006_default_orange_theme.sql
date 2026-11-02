-- Default website theme is orange (corporate_blue). Both themes are allowed by 0005.
-- Existing saved choices are not changed.
alter table public.business_settings alter column theme set default 'corporate_blue';
