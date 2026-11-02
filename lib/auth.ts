import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { ROLE_KEYS, type RoleKey } from './roles';

export const ADMIN_COOKIE = 'padmaarc_admin';
const SESSION_SECONDS = 60 * 60 * 8;
export const OWNER_ID = 'owner';

export type SessionUser = { id: string; role: RoleKey };

function signingSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim()
    || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    || process.env.ADMIN_PASSWORD?.trim()
    || '';
}

function sign(payload: string): string {
  return createHmac('sha256', signingSecret()).update(payload).digest('base64url');
}

/** Creates a signed session for a user. Payload: v2 . expiry . user id . role . nonce . signature */
export function sessionToken(user: SessionUser): string {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const nonce = randomBytes(18).toString('base64url');
  const payload = ['v2', expires, user.id, user.role, nonce].join('.');
  return payload + '.' + sign(payload);
}

export function readSession(token: string): SessionUser | null {
  const parts = token.split('.');
  if (parts.length !== 6) return null;
  const [version, expiresText, id, role, nonce, signature] = parts;
  if (version !== 'v2' || !nonce || !signature) return null;
  const expires = Number(expiresText);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expires) || expires <= now || expires > now + SESSION_SECONDS + 60) return null;
  const validId = id === OWNER_ID || /^[0-9a-f-]{36}$/i.test(id);
  if (!validId || !(ROLE_KEYS as readonly string[]).includes(role)) return null;
  const payload = ['v2', expiresText, id, role, nonce].join('.');
  const expected = new Uint8Array(Buffer.from(sign(payload)));
  const provided = new Uint8Array(Buffer.from(signature));
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  return { id, role: role as RoleKey };
}

export async function sessionFromCookies(): Promise<SessionUser | null> {
  const cookie = (await cookies()).get(ADMIN_COOKIE);
  return cookie ? readSession(cookie.value) : null;
}

/** The studio owner signs in with the ADMIN_PASSWORD environment variable. */
export function checkPassword(p: string): boolean {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || !p) return false;
  const expected = new Uint8Array(Buffer.from(configured));
  const provided = new Uint8Array(Buffer.from(p));
  return expected.length === provided.length && timingSafeEqual(provided, expected);
}

export async function isAdmin(): Promise<boolean> {
  return (await sessionFromCookies()) !== null;
}

export { SESSION_SECONDS };
