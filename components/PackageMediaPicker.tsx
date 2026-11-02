'use client';

import { useState } from 'react';
import { uploadFile, type Kind } from '@/components/MediaAdmin';

/** Cover photo and optional short video for a package. Uploads straight to storage, then saves with the form. */
export function PackageMediaPicker({ coverUrl, coverVideoUrl }: { coverUrl?: string; coverVideoUrl?: string }) {
  const [cover, setCover] = useState(coverUrl || '');
  const [video, setVideo] = useState(coverVideoUrl || '');
  const [busy, setBusy] = useState<'' | Kind>('');
  const [message, setMessage] = useState('');

  async function pick(kind: Kind, file: File | undefined) {
    if (!file) return;
    setBusy(kind);
    setMessage('');
    const result = await uploadFile(file, kind);
    setBusy('');
    if (result.ok) {
      if (kind === 'image') setCover(result.publicUrl); else setVideo(result.publicUrl);
      setMessage('Uploaded. Save the package to publish it.');
    } else {
      setMessage(result.error);
    }
  }

  return (
    <fieldset className="package-media wide">
      <legend>Package media</legend>
      <div className="package-media-grid">
        <div className="package-media-slot">
          <span className="package-media-label">Cover photo</span>
          <div className="package-media-preview">
            {cover ? <img src={cover} alt="Package cover preview" /> : <span>No photo yet</span>}
          </div>
          <div className="package-media-actions">
            <label className="btn btn-outline btn-sm">
              {busy === 'image' ? 'Uploading…' : cover ? 'Replace photo' : 'Upload photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={busy !== ''} onChange={(e) => pick('image', e.target.files?.[0])} />
            </label>
            {cover && <button type="button" className="btn btn-outline btn-sm" onClick={() => setCover('')}>Remove</button>}
          </div>
        </div>

        <div className="package-media-slot">
          <span className="package-media-label">Short video (optional)</span>
          <div className="package-media-preview">
            {video ? <video src={video} muted playsInline controls preload="metadata" /> : <span>No video yet</span>}
          </div>
          <div className="package-media-actions">
            <label className="btn btn-outline btn-sm">
              {busy === 'video' ? 'Uploading…' : video ? 'Replace video' : 'Upload video'}
              <input type="file" accept="video/mp4,video/webm" hidden disabled={busy !== ''} onChange={(e) => pick('video', e.target.files?.[0])} />
            </label>
            {video && <button type="button" className="btn btn-outline btn-sm" onClick={() => setVideo('')}>Remove</button>}
          </div>
        </div>
      </div>
      <p className="package-media-hint">Photo up to 10 MB (JPG, PNG, WebP). Video up to 100 MB (MP4 or WebM). A video plays on the card in place of the photo.</p>
      {message && <p className="package-media-message" role="status">{message}</p>}
      <input type="hidden" name="coverUrl" value={cover} />
      <input type="hidden" name="coverVideoUrl" value={video} />
    </fieldset>
  );
}
