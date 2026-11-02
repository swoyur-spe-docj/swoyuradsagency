import { readFile } from 'node:fs/promises';

try {
  const local = await readFile(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of local.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* Host-injected environment is supported. */ }

const base = process.env.SUPABASE_URL?.replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before checking the business backend.');
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const tables = [
  'business_settings', 'business_packages', 'business_clients', 'business_orders',
  'business_payments', 'business_client_packages', 'business_enquiries',
  'business_meta_entries', 'business_portfolio', 'business_media', 'business_staff',
];

try {
  const specResponse = await fetch(`${base}/rest/v1/`, {
    headers: { ...headers, Accept: 'application/openapi+json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!specResponse.ok) throw new Error(`Supabase API unavailable (HTTP ${specResponse.status}).`);
  const spec = await specResponse.json();
  const requiredFunctions = [
    'create_business_order', 'set_business_order_status', 'update_business_order_details',
    'add_business_payment', 'activate_business_order', 'bump_business_quota',
    'save_business_package', 'delete_business_package', 'move_business_portfolio', 'consume_rate_limit',
  ];
  const missingTables = tables.filter((table) => !spec.paths?.[`/${table}`]);
  const missingFunctions = requiredFunctions.filter((name) => !spec.paths?.[`/rpc/${name}`]?.post);
  if (missingTables.length || missingFunctions.length) {
    const missing = [...missingTables, ...missingFunctions.map((name) => `rpc/${name}`)];
    throw new Error(`Supabase schema is incomplete. Missing: ${missing.join(', ')}. Apply the matching migrations: 0003_safety_baseline.sql, 0004_business_backend.sql, and 0008_staff_roles.sql.`);
  }

  const packagesResponse = await fetch(`${base}/rest/v1/business_packages?select=id&active=eq.true&limit=1`, {
    headers,
    signal: AbortSignal.timeout(10000),
  });
  if (!packagesResponse.ok) throw new Error(`Could not read business packages (HTTP ${packagesResponse.status}).`);
  const packages = await packagesResponse.json();
  if (!packages.length) throw new Error('The backend is installed, but it has no active packages. Add or activate a package in the admin panel.');
  console.log(`Supabase backend is ready: ${tables.length} tables, ${requiredFunctions.length} RPCs, and active packages are reachable.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Supabase business backend check failed.');
  process.exit(1);
}
