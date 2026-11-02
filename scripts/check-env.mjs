import { readFile } from 'node:fs/promises';

// Next loads .env.local automatically. This script also reads it for direct Node runs.
try {
  const local = await readFile(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of local.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* .env.local is optional when the host injects variables. */ }

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SITE_URL'];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Set them in .env.local or in your deployment environment. Values are never printed.');
  process.exit(1);
}

const adminPassword = process.env.ADMIN_PASSWORD?.trim() || '';
if (!adminPassword || adminPassword.length < 12 || /^(change-me|replace|password|admin|your-)/i.test(adminPassword)) {
  console.error('ADMIN_PASSWORD must be set, at least 12 characters, and not a placeholder. Values are never printed.');
  process.exit(1);
}
const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim() || '';
if (sessionSecret && sessionSecret.length < 32) {
  console.error('ADMIN_SESSION_SECRET must be at least 32 characters (generate one with: openssl rand -hex 32).');
  process.exit(1);
}
if (!sessionSecret) console.warn('Warning: ADMIN_SESSION_SECRET is not set. Set it before going live (openssl rand -hex 32).');

let supabaseUrl;
try {
  supabaseUrl = new URL(process.env.SUPABASE_URL);
  if (!['http:', 'https:'].includes(supabaseUrl.protocol)) throw new Error();
} catch {
  console.error('SUPABASE_URL must be a valid http(s) URL.');
  process.exit(1);
}

try {
  const response = await fetch(new URL('/rest/v1/', supabaseUrl), {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/openapi+json',
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    console.error(`Supabase connectivity check failed (HTTP ${response.status}). Confirm URL, service-role key, and project availability.`);
    process.exit(1);
  }
  console.log('Environment variables are present; Supabase REST API is reachable.');
} catch (error) {
  console.error(`Could not reach Supabase REST API: ${error instanceof Error ? error.message : 'unknown network error'}`);
  process.exit(1);
}
