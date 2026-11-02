// Create four local test accounts in a Supabase project and attach their roles.
// Run only in a development project with SUPABASE_SERVICE_ROLE_KEY set.
const base = process.env.SUPABASE_URL?.replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.SEED_TEST_PASSWORD;
if (!base || !serviceKey || !password || password.length < 12) {
  throw new Error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SEED_TEST_PASSWORD (12+ characters).');
}

const accounts = [
  ['admin@example.test', 'Padmaarc Admin', 'admin'],
  ['manager@example.test', 'Padmaarc Manager', 'manager'],
  ['designer@example.test', 'Padmaarc Designer', 'designer'],
  ['editor@example.test', 'Padmaarc Editor', 'editor'],
];

for (const [email, full_name, role] of accounts) {
  const response = await fetch(`${base}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name } }),
  });
  const result = await response.json();
  if (!response.ok && !String(result.msg ?? result.message ?? '').toLowerCase().includes('already')) {
    throw new Error(`Could not create ${email}: ${JSON.stringify(result)}`);
  }
  const userId = result.id;
  if (!userId) continue;
  const profile = await fetch(`${base}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ id: userId, full_name, role, active: true }),
  });
  if (!profile.ok) throw new Error(`Could not assign ${role} to ${email}: ${await profile.text()}`);
  console.log(`Seeded ${role}: ${email}`);
}
