# Acceptance checks

## Phase 1 verification

Commands intended after configuring `.env.local` and applying `supabase/schema.sql` followed by `supabase/migrations/0003_safety_baseline.sql`:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run check-env
```

`npm test` reads the configured service-role value from `.env.local` and scans built browser assets for that value and its identifier. The full unit, integration, and browser suites in Phase 7 are not present yet. The environment and rate-limit RPC checks reach the configured Supabase project. The results below are the earlier 0.3.0 foundation checks.

The 0.4.0 Supabase repository and `0004_business_backend.sql` were added afterward; the production SQL editor did not accept the migration text through the available UI, so the new migration has not been applied or live-flow checked yet. After applying it, run `npm run check:backend` before using checkout/admin flows.

Results on 2026-10-30:

| Command/check | Result | Notes |
|---|---|---|
| `npm run typecheck` | PASS | `tsc --noEmit` |
| `npm run lint` | PASS | Existing `<img>` optimization warnings remain for the public redesign phase. |
| `npm test` | PASS | Scanned 46 production client assets; no service-role key identifier or configured value was found. |
| `npm run test:ratelimit` | PASS | Two requests were allowed and the third was blocked for a fresh hashed key. |
| `npm run build` | PASS | Ran with `NEXT_BUILD_DIR=.next-build-final` because the existing OneDrive `.next` folder denies replacement; Next production compilation, type checking, and static generation completed. |
| `npm run check-env` | PASS | Required environment variables are present and the Supabase REST API is reachable. Values are not printed. |
| Apply/test Supabase migration and rate-limit RPC | PASS | The owner applied the schema and migration `0003`; the rate-limit RPC passed its allow/allow/block check. |

Status reflects checks run in this environment. “FAIL” means the full acceptance flow was not verified, not that the feature is known to be broken.

| Check | Result | Notes |
|---|---|---|
| A. Domain split | PASS | `http://localhost:3000/admin` returned 404 with body `Not found`. `admin.localhost` could not be resolved from the PowerShell test host, so its redirect path is covered by code review only. |
| B. Login/logout | FAIL | Wrong and correct password, dashboard access, and logout were not exercised in a browser. |
| C. Customer checkout | FAIL | A full browser order submission was not exercised. |
| D. Dashboard/orders/search/filter | FAIL | Not exercised with a created test order. |
| E. Status updates/payment display | FAIL | Not exercised end to end. |
| F. Partial and final payments | FAIL | Not exercised end to end. |
| G. Campaign activation | FAIL | Not exercised end to end. |
| H. Quota limits | FAIL | Not exercised end to end. |
| I. Cancellation reason | FAIL | Not exercised end to end. |
| J. Package price snapshot | FAIL | Not exercised end to end. |
| K. Package featured/deletion behavior | FAIL | Not exercised end to end. |
| L. Portfolio publish/order behavior | FAIL | Not exercised end to end. |
| M. Meta Ads log | FAIL | Not exercised end to end. |
| N. Enquiry workflow | FAIL | Not exercised end to end. |
| O. Reports and CSV download | FAIL | Not exercised end to end. |
| P. Theme switching | FAIL | Not exercised in a browser. |
| Q. Mobile layouts | FAIL | Not visually checked at 375px, 768px, and 1280px. |
| Production build | PASS | `npm run build` completed successfully with type checking. |
