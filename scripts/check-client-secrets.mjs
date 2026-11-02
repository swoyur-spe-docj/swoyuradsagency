import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const buildDir = process.env.NEXT_BUILD_DIR || '.next';
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const root = join(projectRoot, buildDir, 'static');
const forbidden = [/SUPABASE_SERVICE_ROLE_KEY/, /serviceRoleKey/i];
let files = 0;

// Plain Node does not load .env.local automatically; read it so the actual configured secret is checked.
try {
  const localEnv = await readFile(join(projectRoot, '.env.local'), 'utf8');
  for (const line of localEnv.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* Deployment environments may inject variables without a local env file. */ }

async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await scan(path);
    else {
      files++;
      const text = await readFile(path, 'utf8');
      if (forbidden.some((pattern) => pattern.test(text))) throw new Error(`Server credential identifier found in client asset: ${path}`);
      const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (secret && secret.length >= 16 && text.includes(secret)) throw new Error(`Service-role secret found in client asset: ${path}`);
    }
  }
}
try {
  await scan(root);
  if (!files) throw new Error('No client assets found. Run the production build before checking for leaked secrets.');
  console.log(`Checked ${files} client assets; no service-role credential found.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
