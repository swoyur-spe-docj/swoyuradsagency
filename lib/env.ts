import 'server-only';

/** Server-only environment validation. Never import this module from a client component. */
const REQUIRED_SERVER = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] as const;

export const REQUIRED_ENV = [...REQUIRED_SERVER, 'NEXT_PUBLIC_SITE_URL'] as const;
export type RequiredEnvName = (typeof REQUIRED_ENV)[number];

export function missingEnvironment(): RequiredEnvName[] {
  return REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
}

export function environmentIssues(): string[] {
  const issues = missingEnvironment().map((name) => `${name} is not set`);
  for (const name of ['SUPABASE_URL', 'NEXT_PUBLIC_SITE_URL'] as const) {
    const value = process.env[name]?.trim();
    if (!value) continue;
    try {
      const url = new URL(value);
      if (!['https:', 'http:'].includes(url.protocol) || (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')) throw new Error();
      if (/your-project|example\.com/i.test(url.hostname)) issues.push(`${name} still contains an example URL`);
    } catch {
      issues.push(`${name} must be a valid ${process.env.NODE_ENV === 'production' ? 'HTTPS' : 'HTTP or HTTPS'} URL`);
    }
  }
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || '';
  if (!adminPassword) issues.push('ADMIN_PASSWORD is not set');
  else {
    if (adminPassword.length < 12) issues.push('ADMIN_PASSWORD must be at least 12 characters');
    if (/^(change-me|replace|password|admin|your-)/i.test(adminPassword)) issues.push('ADMIN_PASSWORD is still a placeholder or too common');
  }
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim() || '';
  if (process.env.NODE_ENV === 'production' && sessionSecret.length < 32) issues.push('ADMIN_SESSION_SECRET must be set (at least 32 characters) in production');
  if (sessionSecret && sessionSecret.length < 32) issues.push('ADMIN_SESSION_SECRET must be at least 32 characters');
  for (const name of ['SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] as const) {
    const value = process.env[name]?.trim();
    if (value && /^(your-|replace-|change-me)/i.test(value)) issues.push(`${name} still contains an example value`);
  }
  return [...new Set(issues)];
}

export function hasApplicationEnvironment(): boolean {
  return environmentIssues().length === 0;
}

export function serverEnvironment() {
  const issues = environmentIssues();
  if (issues.length) throw new Error(issues.join('; '));
  const supabaseUrl = process.env.SUPABASE_URL!.replace(/\/$/, '');
  new URL(supabaseUrl);
  return {
    supabaseUrl,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, ''),
  };
}

/** Absolute address of the public website. Use this for any link that must leave the admin subdomain. */
export function publicSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') || '';
  return /^https?:\/\//.test(value) ? value : 'http://localhost:3000';
}
