import { REQUIRED_ENV } from '@/lib/env';

export function SetupRequired({ issues }: { issues: string[] }) {
  return (
    <main className="container section narrow setup-page">
      <p className="eyebrow">PADMAARC · SETUP REQUIRED</p>
      <h1>Finish the server setup to open this site.</h1>
      <p className="muted">Add the following variables to <code>.env.local</code> for local development or to your hosting provider’s server environment, then restart or redeploy.</p>
      <ul>{issues.map((issue) => <li key={issue}><code>{issue}</code></li>)}</ul>
      <p className="muted">Keep <code>SUPABASE_SERVICE_ROLE_KEY</code> private. It must only be available to server code.</p>
      <p className="muted">Use <code>.env.example</code> as a checklist. Do not paste secret values into the browser.</p>
      <p>Setup instructions are in the project’s <code>README.md</code>.</p>
      <ul>{REQUIRED_ENV.filter((name) => process.env[name]?.trim()).map((name) => <li key={name} className="setup-present"><code>{name}</code> is set</li>)}</ul>
    </main>
  );
}
