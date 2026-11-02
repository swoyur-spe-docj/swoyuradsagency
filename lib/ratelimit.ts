import 'server-only';
import { createHash } from 'node:crypto';
import { serverEnvironment } from './env';

export type RateLimitResult = { allowed: boolean; remaining: number; resetAt: string };

/** Store only a one-way hash of the scope and source identifier in Supabase. */
export async function consumeRateLimit(
  scope: 'login' | 'checkout' | 'enquiry' | 'approval',
  source: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const { supabaseUrl, supabaseServiceRoleKey } = serverEnvironment();
  const keyHash = createHash('sha256').update(`${scope}:${source}`).digest('hex');
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_rate_limit`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_key_hash: keyHash, p_limit: limit, p_window_seconds: windowSeconds }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('The request limit service is unavailable. Please try again shortly.');
  const rows = await response.json() as { allowed: boolean; remaining: number; reset_at: string }[];
  const row = rows[0];
  if (!row || typeof row.allowed !== 'boolean') throw new Error('The request limit service returned an invalid response.');
  return { allowed: row.allowed, remaining: row.remaining, resetAt: row.reset_at };
}

/** Prefer reverse-proxy supplied client IP metadata, and never persist the raw value. */
export function sourceAddress(headers: Headers): string {
  const direct = headers.get('x-real-ip') || headers.get('cf-connecting-ip');
  if (direct?.trim()) return direct.trim().slice(0, 128);
  const forwarded = headers.get('x-forwarded-for');
  return forwarded?.split(',').at(-1)?.trim().slice(0, 128) || 'unknown';
}
