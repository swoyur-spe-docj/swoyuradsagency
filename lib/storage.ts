import 'server-only';
import { randomUUID } from 'crypto';
import { serverEnvironment } from './env';

export const MEDIA_BUCKET = 'site-media';

type Kind = 'image' | 'video';
const ALLOWED: Record<string, { kind: Kind; ext: string }> = {
  'image/jpeg': { kind: 'image', ext: 'jpg' },
  'image/png': { kind: 'image', ext: 'png' },
  'image/webp': { kind: 'image', ext: 'webp' },
  'image/gif': { kind: 'image', ext: 'gif' },
  'video/mp4': { kind: 'video', ext: 'mp4' },
  'video/webm': { kind: 'video', ext: 'webm' },
};
const MAX_BYTES: Record<Kind, number> = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 };

export type UploadRequest = { name: string; type: string; size: number; kind: Kind };
export type UploadTicket = { uploadUrl: string; publicUrl: string };

/** Checks type, kind and size. Returns the file extension to store the file under. */
export function validateUpload(input: UploadRequest): { ok: true; ext: string } | { ok: false; error: string } {
  const rule = ALLOWED[input.type];
  if (!rule) return { ok: false, error: 'Use a JPG, PNG, WebP, GIF, MP4 or WebM file.' };
  if (rule.kind !== input.kind) return { ok: false, error: input.kind === 'video' ? 'Choose an MP4 or WebM video.' : 'Choose an image file.' };
  if (!Number.isFinite(input.size) || input.size <= 0) return { ok: false, error: 'The file is empty.' };
  if (input.size > MAX_BYTES[input.kind]) {
    return { ok: false, error: input.kind === 'video' ? 'Videos must be 100 MB or smaller.' : 'Images must be 10 MB or smaller.' };
  }
  return { ok: true, ext: rule.ext };
}

/** Creates a short-lived signed upload URL. The file itself goes straight from the browser to storage. */
export async function createUploadTicket(input: UploadRequest): Promise<UploadTicket> {
  const check = validateUpload(input);
  if (!check.ok) throw new Error(check.error);
  const { supabaseUrl, supabaseServiceRoleKey } = serverEnvironment();
  const path = `${input.kind}/${Date.now()}-${randomUUID()}.${check.ext}`;
  const response = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${MEDIA_BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: supabaseServiceRoleKey, Authorization: `Bearer ${supabaseServiceRoleKey}`, 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('The upload could not be prepared. Please try again.');
  const json = (await response.json()) as { url?: string };
  if (!json.url) throw new Error('The upload could not be prepared. Please try again.');
  return {
    uploadUrl: `${supabaseUrl}/storage/v1${json.url}`,
    publicUrl: `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`,
  };
}

/** Removes a file this studio uploaded (ignores files hosted anywhere else). */
export async function deleteStoredFile(publicUrl: string): Promise<void> {
  const { supabaseUrl, supabaseServiceRoleKey } = serverEnvironment();
  const prefix = `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/`;
  if (!publicUrl.startsWith(prefix)) return;
  const path = publicUrl.slice(prefix.length).split('?')[0];
  if (!/^(image|video)\/[A-Za-z0-9._-]+$/.test(path)) return;
  await fetch(`${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${path}`, {
    method: 'DELETE',
    headers: { apikey: supabaseServiceRoleKey, Authorization: `Bearer ${supabaseServiceRoleKey}` },
    cache: 'no-store',
  }).catch(() => undefined);
}
