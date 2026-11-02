'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addCustomMediaAction, createUploadTicketAction, deleteCustomMediaAction, setMediaAction } from '@/app/actions';
import type { MediaAsset } from '@/lib/media';

export type Kind = 'image' | 'video';
const ACCEPT: Record<Kind, string> = { image: 'image/jpeg,image/png,image/webp,image/gif', video: 'video/mp4,video/webm' };
const MAX_BYTES: Record<Kind, number> = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 };
const MAX_LABEL = { mb: 10, vb: 100 };

/** Checks the file in the browser first (fast feedback), then uploads it straight to storage. */
export async function uploadFile(file: File, kind: Kind): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
  if (!ACCEPT[kind].split(',').includes(file.type)) {
    return { ok: false, error: kind === 'video' ? 'Choose an MP4 or WebM video.' : 'Choose a JPG, PNG, WebP or GIF image.' };
  }
  if (file.size > MAX_BYTES[kind]) {
    return { ok: false, error: kind === 'video' ? `Videos must be ${MAX_LABEL.vb} MB or smaller.` : `Images must be ${MAX_LABEL.mb} MB or smaller.` };
  }
  const ticket = await createUploadTicketAction({ name: file.name, type: file.type, size: file.size, kind });
  if (!ticket.ok) return { ok: false, error: ticket.error };
  const response = await fetch(ticket.ticket.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type, 'x-upsert': 'false' },
    body: file,
  });
  if (!response.ok) return { ok: false, error: 'The upload did not finish. Check your connection and try again.' };
  return { ok: true, publicUrl: ticket.ticket.publicUrl };
}

function Preview({ kind, url, poster, alt }: { kind: Kind; url: string; poster?: string; alt: string }) {
  if (!url) return <div className="media-empty">No file yet</div>;
  return kind === 'video'
    ? <video src={url} poster={poster || undefined} controls muted playsInline preload="metadata" />
    : <img src={url} alt={alt} loading="lazy" />;
}

function Status({ busy, message, error }: { busy: string; message: string; error: string }) {
  if (busy) return <div className="media-status is-busy" role="status"><span className="media-progress" aria-hidden="true" /><span>{busy}</span></div>;
  if (error) return <div className="media-status is-error" role="alert">{error}</div>;
  if (message) return <div className="media-status is-done" role="status">{message}</div>;
  return null;
}

/** Replaces the file of a built-in website slot. */
export function MediaSlot({ item, poster }: { item: MediaAsset; poster?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [urlDraft, setUrlDraft] = useState('');

  async function save(url: string) {
    const res = await setMediaAction({ id: item.id, url });
    if ('error' in res) { setError(res.error); return; }
    setMessage('Updated. The website shows this now.');
    router.refresh();
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(''); setMessage(''); setBusy('Uploading…');
    const up = await uploadFile(file, item.kind);
    if (!up.ok) { setBusy(''); setError(up.error); return; }
    setBusy('Saving…');
    await save(up.publicUrl);
    setBusy('');
  }

  return (
    <section className="card media-card media-slot">
      <div className="media-preview"><Preview kind={item.kind} url={item.url} poster={poster || item.posterUrl} alt={item.alt} /></div>
      <div className="media-card-heading"><h2>{item.label}</h2><span className="pill">{item.kind}</span></div>
      <label className="media-upload">
        <span>{item.kind === 'video' ? 'Upload a new video (MP4 or WebM, up to 100 MB)' : 'Upload a new image (JPG, PNG, WebP or GIF, up to 10 MB)'}</span>
        <input type="file" accept={ACCEPT[item.kind]} disabled={!!busy} onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
      </label>
      <Status busy={busy} message={message} error={error} />
      <details className="media-url">
        <summary>Or paste a web address</summary>
        <div className="media-url-row">
          <input type="url" value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder={item.kind === 'video' ? 'https://… .mp4' : 'https://…'} />
          <button type="button" className="btn btn-outline btn-sm" disabled={!urlDraft.trim() || !!busy} onClick={() => save(urlDraft.trim())}>Use address</button>
        </div>
      </details>
    </section>
  );
}

/** Adds a brand-new image or video to the library. It also appears in the portfolio gallery. */
export function NewMediaForm() {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>('image');
  const [label, setLabel] = useState('');
  const [alt, setAlt] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(''); setMessage('');
    if (label.trim().length < 2) { setError('Give the item a short name first (at least 2 letters).'); return; }
    setBusy('Uploading…');
    const up = await uploadFile(file, kind);
    if (!up.ok) { setBusy(''); setError(up.error); return; }
    setBusy('Saving…');
    const res = await addCustomMediaAction({ label, kind, url: up.publicUrl, alt });
    setBusy('');
    if ('error' in res) { setError(res.error); return; }
    setMessage('Added. It now appears in your library and in the portfolio gallery.');
    setLabel(''); setAlt('');
    router.refresh();
  }

  return (
    <div className="media-new">
      <div className="form-2">
        <label>Name *<input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} placeholder="e.g. Diwali reel, Shop opening poster" /></label>
        <label>Type<select value={kind} onChange={(e) => setKind(e.target.value as Kind)}><option value="image">Image</option><option value="video">Video</option></select></label>
      </div>
      <label>Description for screen readers (optional)<input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={180} placeholder="What the picture or video shows" /></label>
      <label className="media-upload">
        <span>{kind === 'video' ? 'Choose the video file (MP4 or WebM, up to 100 MB)' : 'Choose the image file (JPG, PNG, WebP or GIF, up to 10 MB)'}</span>
        <input type="file" accept={ACCEPT[kind]} disabled={!!busy} onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
      </label>
      <Status busy={busy} message={message} error={error} />
    </div>
  );
}

/** One admin-added item, with a delete button. */
export function CustomMediaItem({ item }: { item: MediaAsset }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function remove() {
    if (!window.confirm(`Delete "${item.label}"? This cannot be undone.`)) return;
    setBusy(true); setError('');
    const res = await deleteCustomMediaAction(item.id);
    setBusy(false);
    if ('error' in res) { setError(res.error || 'Could not delete.'); return; }
    router.refresh();
  }

  return (
    <section className="card media-card">
      <div className="media-preview"><Preview kind={item.kind} url={item.url} alt={item.alt} /></div>
      <div className="media-card-heading"><h2>{item.label}</h2><span className="pill">{item.kind}</span></div>
      <button type="button" className="btn btn-outline btn-sm media-delete" onClick={remove} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button>
      {error ? <div className="media-status is-error" role="alert">{error}</div> : null}
    </section>
  );
}
