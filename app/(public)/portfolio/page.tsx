import Link from 'next/link';
import { listPortfolio, listMedia } from '@/lib/repo';
import { CATEGORIES } from '@/lib/types';
import { PortfolioCard } from '@/components/PortfolioCard';
import { ActionIcon } from '@/components/ActionIcon';
import { mediaUrl } from '@/lib/media';
import { SafeImage } from '@/components/SafeImage';

export default async function PortfolioPage({ searchParams }: { searchParams: { cat?: string } }) {
  const cat = searchParams.cat || 'All';
  const [allItems, media] = await Promise.all([listPortfolio(true), listMedia()]);
  const items = allItems.filter((i) => cat === 'All' || i.category === cat);
  return (
    <section className="container section">
      <div className="page-banner compact"><div><p className="eyebrow">SELECTED CREATIVE</p><h1>Work built for the real world.</h1><p className="lead">A look at campaigns, content and design made to help brands connect.</p></div><SafeImage className="tilt-card" src={mediaUrl(media, 'portfolio_main')} alt="Selected campaign work from Padmaarc" fetchPriority="high" /></div>
      <div className="filters-row">
        {['All', ...CATEGORIES].map((c) => (
          <Link key={c} className={`chip ${c === cat ? 'on' : ''}`} href={c === 'All' ? '/portfolio' : `/portfolio?cat=${encodeURIComponent(c)}`}>
            {c}
          </Link>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="agency-empty">
          <p className="eyebrow">FIRST CAMPAIGNS · GOING LIVE SOON</p>
          <h2>Case studies arrive as each campaign goes live.</h2>
          <p className="muted">In the meantime, here is what we make for brands in every category.</p>
          <div className="agency-capabilities">
            <Link href="/portfolio?cat=Video" className="card agency-cap"><span className="agency-cap-num">01</span><h3>Video</h3><p className="muted">Short-form reels and ad films cut for social feeds.</p></Link>
            <Link href="/portfolio?cat=Poster" className="card agency-cap"><span className="agency-cap-num">02</span><h3>Posters and design</h3><p className="muted">Offer posters, social creatives and print-ready layouts.</p></Link>
            <Link href="/portfolio?cat=Influencer" className="card agency-cap"><span className="agency-cap-num">03</span><h3>Creators</h3><p className="muted">Influencer collaborations that fit your audience.</p></Link>
            <Link href="/portfolio?cat=Meta%20Ads" className="card agency-cap"><span className="agency-cap-num">04</span><h3>Meta Ads</h3><p className="muted">Campaigns set up and tested for local reach.</p></Link>
          </div>
          <div className="agency-cta">
            <div><h3>Have a campaign in mind?</h3><p className="muted">Tell us your goal. We reply with a clear next step.</p></div>
            <Link className="btn btn-primary" href="/packages"><ActionIcon name="package" /> See packages</Link>
            <Link className="btn btn-outline" href="/contact"><ActionIcon name="contact" /> Talk to the team</Link>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {items.map((i) => <PortfolioCard key={i.id} item={i} />)}
        </div>
      )}
          {media.some((m) => m.custom) ? (
        <div className="portfolio-gallery">
          <p className="eyebrow">MORE FROM THE STUDIO</p>
          <div className="grid-3">
            {media.filter((m) => m.custom).map((m) => (
              <article className="card portfolio-gallery-item" key={m.id}>
                {m.kind === 'video' ? (
                  <video src={m.url} poster={m.posterUrl || undefined} controls muted playsInline preload="metadata" />
                ) : (
                  <SafeImage src={m.url} alt={m.alt || m.label} loading="lazy" />
                )}
                <div className="card-body"><h3>{m.label}</h3></div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
</section>
  );
}
