-- 0010: Security hardening.
-- consume_rate_limit is a SECURITY DEFINER function. PostgreSQL grants EXECUTE to PUBLIC by default,
-- which would let anyone with the public anon key burn a victim's login/checkout quota.
-- Only the server (service_role) should call it.
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
revoke all on public.rate_limits from anon, authenticated;
