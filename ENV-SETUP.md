# Environment setup (.env.local)

The site reads its secrets from `.env.local` on your computer, and from the
environment settings of your host (for example Vercel) when it is live.
Never put real values in the source code, in a shared zip, or in a chat.

## What to fill in

| Variable | What it is | Where to get it |
|---|---|---|
| `ADMIN_PASSWORD` | Password for the admin panel. At least 12 characters, unique, not a common word. | Choose one and keep it in a password manager. |
| `ADMIN_SESSION_SECRET` | Signs admin login cookies. At least 32 characters. Required in production. | Run `openssl rand -hex 32` in a terminal. |
| `SUPABASE_URL` | Your Supabase project address. | Supabase dashboard > Project Settings > API > Project URL. |
| `SUPABASE_ANON_KEY` | Public key for Supabase. | Project Settings > API > `anon` `public`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Private key with full database access. Server only. | Project Settings > API > `service_role`. **Keep it secret.** |
| `NEXT_PUBLIC_SITE_URL` | Public address of the site. Used for links. | `http://localhost:3000` locally, your HTTPS domain when live. |

## Steps

1. Copy `.env.example` to `.env.local` (or edit the existing `.env.local`).
2. Fill in every value. Leave no `your-...` or `change-me` text behind.
3. Run `npm run check-env`. It checks the values and the Supabase connection
   without printing any secret.
4. Run `npm run dev` and open `http://localhost:3000`.

## When the site is live (Vercel or similar)

- Add the same variables in the host's Environment Variables screen. Do not upload `.env.local`.
- Set `NEXT_PUBLIC_SITE_URL` to your HTTPS domain, for example `https://padmaarc.com`.
- Redeploy after changing any variable.

## Security checklist before going live

- [ ] `ADMIN_PASSWORD` is at least 12 characters and only you know it.
- [ ] `ADMIN_SESSION_SECRET` is set, at least 32 characters, and different from the password.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only in `.env.local` and the host's server settings.
- [ ] `.env.local` is not committed to git (it is listed in `.gitignore`).
- [ ] Supabase migrations `schema.sql`, `0003`, `0004`, `0005`, `0006` have been run.
- [ ] Admin panel opens only on the admin subdomain and asks for the password.
- [ ] If any secret was ever shared by mistake, rotate it in Supabase and change the password.

## Developer credit (optional)
Set these in your hosting environment (for example Vercel → Project → Settings → Environment Variables):
- `DEVELOPER_NAME`: your name or studio name. The admin footer shows "Designed and built by ...". Leave empty to hide it.
- `DEVELOPER_URL` (optional): link to your website.
The admin dashboard wish message is edited in `lib/credits.ts`.
