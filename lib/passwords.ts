import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';

const N = 16384, R = 8, P = 1, KEYLEN = 64;

function scryptKey(password: string, salt: Buffer, keylen: number, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, new Uint8Array(salt), keylen, { N: n, r, p }, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptKey(password, salt, KEYLEN, N, R, P);
  return ['scrypt', N, R, P, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltText, keyText] = parts;
  const expected = Buffer.from(keyText, 'base64');
  const key = await scryptKey(password, Buffer.from(saltText, 'base64'), expected.length, Number(n), Number(r), Number(p));
  return key.length === expected.length && timingSafeEqual(new Uint8Array(key), new Uint8Array(expected));
}

/** Returns a message if the password is not strong enough, otherwise null. */
export function passwordProblem(password: string): string | null {
  if (password.length < 12) return 'Password must be at least 12 characters.';
  if (password.length > 200) return 'Password is too long.';
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Use both letters and numbers in the password.';
  return null;
}
