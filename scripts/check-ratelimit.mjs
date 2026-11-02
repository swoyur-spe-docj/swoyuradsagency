import { readFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';

try {
  const local = await readFile(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of local.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* Hosting environments may inject variables directly. */ }

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Values are not printed.');
  process.exit(1);
}

const keyHash = createHash('sha256').update(`rate-limit-check:${randomUUID()}`).digest('hex');
async function attempt() {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_rate_limit`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_key_hash: keyHash, p_limit: 2, p_window_seconds: 60 }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`RPC returned HTTP ${response.status}`);
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1 || typeof rows[0].allowed !== 'boolean') {
    throw new Error('RPC returned an unexpected result.');
  }
  return rows[0];
}

try {
  const first = await attempt();
  const second = await attempt();
  const third = await attempt();
  if (first.allowed && second.allowed && !third.allowed && first.remaining === 1 && second.remaining === 0 && third.remaining === 0) {
    console.log('Rate-limit RPC passed: two requests allowed; the third blocked.');
  } else {
    console.error('Rate-limit RPC returned unexpected allow/remaining values.');
    process.exit(1);
  }
} catch (error) {
  console.error(`Rate-limit RPC check failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exit(1);
}
