# The Padmaarc Advertising - Website and Admin Panel

## Run locally

1. Install Node.js 20 or later and run `npm install`.
2. Copy `.env.example` to `.env.local` and replace every example value. The required server variables are `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL`. Also set a strong `ADMIN_PASSWORD`; `ADMIN_SESSION_SECRET` is optional.
3. Run `npm run check-env` to verify the values and Supabase REST connectivity. This prints variable names and status only; it never prints key values.
4. Run `npm run dev` and open <http://localhost:3000>.
5. The admin panel is at `http://admin.localhost:3000/admin/login` on hosts that resolve `*.localhost`.

The app displays a setup page when required variables are absent, are still example values, or use invalid URLs. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side and do not put it in a `NEXT_PUBLIC_` variable. The publishable/anon key is designed for browser exposure but all database writes in the target architecture must still happen on the server.

## Supabase setup and migration order

1. In a new development project, open the Supabase SQL Editor and run `supabase/schema.sql` once to create the initial CMS schema.
2. Run each file in `supabase/migrations/` in ascending order. `0003_safety_baseline.sql` adds durable rate limits and indexes. `0004_business_backend.sql` creates the persistent orders, payments, clients, enquiries, packages, portfolio, media, settings, and Meta Ads tables plus the transaction RPCs used by the app.
3. Set the four required environment variables, then run `npm run check-env`.
4. Run `npm run check:backend` to confirm that the business tables, transaction RPCs, and active packages are available.
5. Run `npm run test:ratelimit` to verify the deployed rate-limit RPC with a one-off hashed test key.

The rate-limit and business RPCs use the service-role key only in server-side modules/actions. Row-level security is enabled on the business tables, and direct `anon`/`authenticated` access is revoked. Rate limits are shared across app instances once `0003_safety_baseline.sql` has been applied. Checkout, payment recording, campaign activation, and quota updates run through database transactions.

**Current implementation limit:** the existing orders-to-client, enquiry, package, portfolio, settings, media URL, Meta Ads log, dashboard, and CSV flows now persist in Supabase. The admin still uses one configured `ADMIN_PASSWORD` with a signed eight-hour session cookie; role-based Supabase Auth, team management, content calendar/approvals, and file uploads to Supabase Storage are not included. Payments are manual records, not an online payment gateway. Set a strong admin password and complete the owner smoke checks before a live handoff.

## Backups and exports

- Supabase Pro, Team, and Enterprise projects receive daily database backups automatically. Check **Database → Backups** in the Supabase Dashboard and review the retention shown for the project. Backups cover database data, not uploaded Storage objects. See the [Supabase backup guide](https://supabase.com/docs/guides/platform/backups).
- For regular off-site logical backups, install/link the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), then run `supabase db dump --linked --data-only --use-copy -f backups/data.sql` from a linked project. Store backups somewhere separate from this machine and keep database credentials out of shell history.
- To export a table as CSV, open it in the Dashboard **Table Editor** and use its export action. For a query result, run the query in **SQL Editor** and choose CSV export. See [Supabase tables and data](https://supabase.com/docs/guides/database/tables).

## Domains
- Public site: padmaarc.com
- Admin panel: admin.padmaarc.com
- Middleware blocks /admin on the public domain (404) and redirects the admin domain to /admin.

## Current implementation boundary
- Core customer and CRM records persist in the Supabase `business_*` tables. Apply migration `0004_business_backend.sql` before running the app against this repository.
- The admin login uses `ADMIN_PASSWORD` and a signed, expiring cookie. It is a single-admin login, not Supabase Auth with team roles.
- There are no email notifications, payment gateway, or invoices. Payments are recorded manually by the admin.
- Admin media settings persist URLs and alt text; the app does not upload files into Supabase Storage.
- Social profile links are optional and editable in Admin → Settings. Only approved platform domains are rendered as links.
- Team/role dashboards, content calendar, editorial approvals, storage uploads, and production deployment are not implemented yet.

## Order flow
1. Customer picks a package on /packages and fills /checkout. A Supabase order PAD-XXXX is created with status "new" and a private random receipt token.
2. Admin opens the order in Orders, contacts the customer on WhatsApp (templates are on the order page) and sets "contacted".
3. Admin sets "confirmed". Payment details are shown on the customer's order page.
4. Admin records payments. When the full amount is received, status becomes "paid" automatically.
5. Admin clicks "Activate", sets the start date. A client and their quota are created, and status becomes "active".
6. Admin uses +1 video / +1 poster on the Clients page as work is delivered.
