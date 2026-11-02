// Captures real screenshots of the running site (desktop + mobile).
// Usage (site must be running with `npm run dev`):
//   ADMIN_PASSWORD=yourpassword npm run screens
// Output: ./screenshots/*.png
import { mkdirSync } from 'node:fs';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is not installed. Run once:\n  npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN = process.env.ADMIN_URL || 'http://admin.localhost:3000';
const PASSWORD = process.env.ADMIN_PASSWORD || '';
const OUT = 'screenshots';
mkdirSync(OUT, { recursive: true });

const PUBLIC = ['/', '/about', '/services', '/packages', '/portfolio', '/blog', '/careers', '/contact', '/checkout'];
const ADMIN_PAGES = ['/admin', '/admin/orders', '/admin/enquiries', '/admin/packages', '/admin/settings'];
const VIEWPORTS = [
  { name: 'phone-small', width: 360, height: 740, mobile: true },
  { name: 'phone', width: 390, height: 844, mobile: true },
  { name: 'tablet', width: 768, height: 1024, mobile: true },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'monitor', width: 1920, height: 1080 },
];
const slug = (p) => (p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '-'));

const browser = await chromium.launch();
let ok = 0, failed = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.mobile, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const path of PUBLIC) {
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(900); // let entrance animations finish
      await page.screenshot({ path: `${OUT}/${vp.name}-${slug(path)}.png`, fullPage: true });
      ok++;
    } catch (e) { failed.push(`${vp.name} ${path}: ${e.message.split('\n')[0]}`); }
  }
  // admin: log in once per viewport, then capture panel pages
  try {
    await page.goto(ADMIN + '/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[name="password"]', PASSWORD);
    await Promise.all([page.waitForLoadState('networkidle'), page.click('button[type="submit"]')]);
    for (const path of ADMIN_PAGES) {
      try {
        await page.goto(ADMIN + path, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(600);
        await page.screenshot({ path: `${OUT}/${vp.name}-${slug(path)}.png`, fullPage: true });
        ok++;
      } catch (e) { failed.push(`${vp.name} ${path}: ${e.message.split('\n')[0]}`); }
    }
  } catch (e) { failed.push(`${vp.name} admin login: ${e.message.split('\n')[0]}`); }
  await ctx.close();
}
await browser.close();
console.log(`Saved ${ok} screenshots to ./${OUT}/`);
if (failed.length) console.log('Problems:\n- ' + failed.join('\n- '));
