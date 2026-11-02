import Link from 'next/link';
import type { Pkg } from '@/lib/types';
import { inr } from '@/lib/format';
import { ActionIcon } from '@/components/ActionIcon';
import { SafeImage } from '@/components/SafeImage';

export function PackageCard({ p }: { p: Pkg }) {
  const initials = p.name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'P';
  const months = `${p.durationMonths} ${p.durationMonths === 1 ? 'month' : 'months'}`;
  return (
    <article className={`card pkg pkg-v2 tilt-card ${p.featured ? 'featured' : ''}`}>
      <div className="pkg-media">
        {p.coverVideoUrl ? (
          <video src={p.coverVideoUrl} poster={p.coverUrl || undefined} muted loop playsInline autoPlay preload="metadata" aria-label={`${p.name} preview video`} />
        ) : p.coverUrl ? (
          <SafeImage src={p.coverUrl} alt={`${p.name} package`} loading="lazy" />
        ) : (
          <span className="pkg-media-mark" aria-hidden="true">{initials}</span>
        )}
        {p.featured && <span className="pkg-flag">Recommended</span>}
        <span className="pkg-duration">{months}</span>
      </div>

      <div className="pkg-body">
        <h3>{p.name}</h3>
        <p className="package-description">
          A focused monthly content plan with {p.videos} {p.videos === 1 ? 'video' : 'videos'} and {p.posters} {p.posters === 1 ? 'design' : 'designs'} to keep your brand consistent and campaign-ready.
        </p>

        <div className="pkg-price"><span>{inr(p.price)}</span><small>per plan</small></div>

        <div className="pkg-counts">
          <span><strong>{p.videos}</strong> videos</span>
          <span><strong>{p.posters}</strong> designs</span>
        </div>

        {p.deliverables.length > 0 && (
          <ul className="pkg-list">
            {p.deliverables.map((d, i) => (
              <li key={i}><ActionIcon name="check" /> {d}</li>
            ))}
          </ul>
        )}

        <Link className={`btn pkg-cta ${p.featured ? 'btn-primary' : 'btn-outline'}`} href={`/checkout?package=${p.slug}`}>
          <ActionIcon name="package" /> Choose {p.name}
        </Link>
      </div>
    </article>
  );
}
