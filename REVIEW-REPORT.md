# Padmaarc: Code Review Report

## Scope and limits
- Reviewed: auth, middleware, server actions, role matrix, storage, rate limiting, business logic (repo.ts), SQL migrations and RPCs, checkout/order/admin pages (sampled).
- NOT verified: the live site, UI screens, `npm run build`, `npm run typecheck`, and Supabase behaviour. Dependencies were not installed in the review environment. Syntax of changed files was checked with the TypeScript parser only.

## Fixed in this version

### 1. [High, security] CSV orders export had no role check
`/admin/reports/csv` only checked that a session cookie existed. Any signed-in staff member, including designers and editors, and deactivated staff whose 8-hour cookie was still valid, could download every order with customer name, mobile, email, and payment balances.
Fix: the route now requires a live account (`currentUser()`, which checks `active` in the database) with the `reports` permission.

### 2. [Medium] Deactivated staff could get stuck in a redirect loop on the login page
The login page redirected to `/admin` when the cookie merely existed. For a deactivated account, `/admin` then redirected back to `/admin/login`, causing an endless loop.
Fix: the login page uses the same live `currentUser()` check.

### 3. [Medium, security] Rate-limit RPC callable with the public anon key
`consume_rate_limit` is SECURITY DEFINER, and PostgreSQL grants EXECUTE to PUBLIC by default. Anyone could call it through the REST API and exhaust another visitor's login or checkout quota for a chosen IP hash.
Fix: migration `0010_security_hardening.sql` revokes access from anon/authenticated/public and grants it only to `service_role`.

### 4. [Low] Business date used UTC
`today()` used UTC. Between 00:00 and 05:30 IST the checkout date minimum and "days until" counts were one day behind.
Fix: `today()` now uses the Asia/Kolkata timezone.

### 5. [Low] Conflicting database schema
`supabase/schema.sql` describes an old CMS model (projects, posts, leads) that the app does not use. Running it on a new project would create the wrong tables.
Fix: a header now marks it as legacy. Use `supabase/migrations/` in numeric order.

## Found but NOT changed (needs your decision or a bigger change)

- **Cancelling an order that already has partial payments.** `set_business_order_status` allows cancelling a `confirmed` order even when money has been recorded, and there is no refund record. Suggested: block cancellation when payments exist, or add a refund flow.
- **CSV export scalability.** `ordersCsv` puts every order ID into one `in.(...)` URL. With thousands of orders this will exceed URL limits. Suggested: fetch payments per page or aggregate in SQL (a view or RPC).
- **CSV negative numbers.** `csvCell` prefixes any value starting with `-` with an apostrophe, so a negative balance (overpayment) shows as text `'-500`. Suggested: format numbers separately from the formula-injection guard.
- **Sessions are not revoked on logout or password reset.** Logout only clears the browser cookie. A copied token stays valid until it expires (8h). Suggested: a `session_version` column checked on every request.
- **Local admin testing.** The admin panel only works on the `admin.` subdomain, so `localhost` cannot reach `/admin`. Document a dev override or add a `/etc/hosts` note.
- **Parameter naming.** `/order/[orderNumber]` actually takes a receipt token (UUID). Rename to `[token]` to avoid confusion. The lookup itself validates the UUID, so it is safe.
- **Default media is hotlinked** from Unsplash and Pexels. If those sites change or remove files, the home page breaks. Suggested: download and store them in Supabase storage.
- **No automated flow tests.** `npm test` checks only secrets and environment setup. Suggested: Playwright tests for checkout, payment, and status transitions.
- **Dependency check.** Keep Next.js on 14.2.25 or later (this is already the case in package.json). Re-run `npm audit` after install.

## Suggested next steps (improvements)
1. Run `npm ci && npm run typecheck && npm run build` and `npm test`.
2. Apply migration 0010 in Supabase.
3. Decide the cancel-with-payment rule (see above).
4. Add session revocation.
5. Add Playwright tests for checkout to payment to activation.
