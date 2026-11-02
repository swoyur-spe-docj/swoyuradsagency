# Padmaarc QA checklist (run before every release)

Run once on each device: phone (360-430px), tablet (768px), laptop (1366px), large monitor (1920px+).
Do it for BOTH themes (Orange and Green) by switching the theme in admin Settings.

## Public site
- [ ] Home, About, Services, Packages, Work, Journal, Careers, Contact all load without errors
- [ ] Menu opens and closes (button, X, backdrop, Esc). Links navigate and close the menu
- [ ] Primary buttons show gradient and glow; outline buttons show a visible border
- [ ] Sticky mobile bar (Call / WhatsApp / Enquire) does not cover the footer
- [ ] Contact form: fields readable, width capped on laptop, submit shows success or a clear error
- [ ] Checkout: package selection, date, GST field, agree checkbox, place order
- [ ] Order receipt page opens from the receipt link
- [ ] No horizontal scrolling on any page
- [ ] Footer links, socials, WhatsApp, email and map links open correctly

## Admin panel (admin subdomain)
- [ ] Login works; wrong password shows an error; logout works
- [ ] A deactivated staff account is sent to login (no redirect loop)
- [ ] Sidebar / mobile menu navigates to every section
- [ ] Orders: list, open an order, change status, add payment, assign designer
- [ ] Reports: CSV downloads only for users with the reports permission
- [ ] Settings: theme change applies on the public site after reload
- [ ] Tables scroll sideways inside their box on phones (no page-wide overflow)

## Build and data
- [ ] npm ci && npm run typecheck && npm run build pass
- [ ] Supabase migrations 0001 to 0011 applied in order
- [ ] Browser console shows no red errors on any page
