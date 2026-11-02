import type { PortfolioItem } from '@/lib/types';
import { SafeImage } from '@/components/SafeImage';

export function PortfolioCard({ item }: { item: PortfolioItem }) {
  const inner = (
    <>
      <div className="thumb">
        {item.thumbUrl ? <SafeImage src={item.thumbUrl} alt={item.title} /> : <span>{item.category}</span>}
      </div>
      <div className="card-body">
        <span className="pill">{item.category}</span>
        <h3 style={{ marginTop: 8, marginBottom: 0 }}>{item.title}</h3>
      </div>
    </>
  );
  if (item.slug) {
    return (
      <a className="card portfolio tilt-card" href={`/portfolio/${item.slug}`}>
        {inner}
        <span className="card-cta">View case study <span aria-hidden="true">→</span></span>
      </a>
    );
  }
  return item.videoUrl ? (
    <a className="card portfolio tilt-card" href={item.videoUrl} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    <article className="card portfolio tilt-card">{inner}</article>
  );
}
