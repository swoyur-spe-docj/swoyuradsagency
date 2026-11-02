# Team accounts and roles

## Setup (once)

1. Run the migration `supabase/migrations/0008_staff_roles.sql` in Supabase.
2. Sign in to the admin panel with the studio owner password (`ADMIN_PASSWORD`). Leave the email field empty.
3. Open **Team** in the sidebar and add people.

## Roles

| Role | Can see and do |
|---|---|
| **Admin** | Everything, including Team and Settings. Can create other admins. |
| **Manager** | Orders, payments, clients, enquiries, packages, Meta Ads log, reports. Assigns orders to the team. |
| **Editor** | Portfolio and Media library. Their home screen links straight to these. |
| **Designer** | Only the orders assigned to them: the brief and the team notes. Payments and other orders are hidden. |

Access is checked on every request. If you deactivate someone or change their role, the change applies on their next click, and they are signed out of anything they should no longer see.

## Daily use

- **Assign an order:** open the order in Orders. Managers and admins see an "Assignment" box at the top. Choose a person and save.
- **Designer:** signs in with their email and password. Their home shows open orders. "My tasks" lists everything assigned to them.
- **Reset a password:** Team → the person's card → Reset password. Share the new password privately.

## Security notes

- Passwords are stored as scrypt hashes, never in plain text. Minimum 12 characters with letters and numbers.
- Wrong sign-in attempts are limited per internet address (5 per 5 minutes).
- Sign-in errors never reveal whether an email exists.
- The owner password is only for the studio owner. Keep it strong and do not share it with the team; give everyone else their own account.
