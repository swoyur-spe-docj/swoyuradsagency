// Shows published agency insights without inventing sample articles.
// New posts can be added after the CMS is connected to the Supabase schema.
import Link from 'next/link';
import { listMedia } from '@/lib/repo';
import { mediaUrl } from '@/lib/media';
import { SafeImage } from '@/components/SafeImage';
import { ActionIcon } from '@/components/ActionIcon';

export default async function BlogPage() {
  const media = await listMedia();
  return <section className="section container">
    <div className="page-banner compact"><div><p className="eyebrow">THE JOURNAL · NOTES ON CREATIVE AND GROWTH</p><h1>Ideas for building brands people remember.</h1></div><SafeImage className="tilt-card" src={mediaUrl(media, 'blog_main')} alt="Notes and ideas at a creative desk" fetchPriority="high" /></div>
    <div className="agency-empty">
      <p className="eyebrow">FIRST FIELD NOTES · COMING SOON</p>
      <h2>Practical ideas for businesses that want to be noticed.</h2>
      <div className="agency-capabilities">
        <article className="card agency-cap"><span className="agency-cap-num">01</span><h3>Content that stops the scroll</h3><p className="muted">How to open a video or post so people keep watching.</p></article>
        <article className="card agency-cap"><span className="agency-cap-num">02</span><h3>Meta Ads for local business</h3><p className="muted">Setting a clear goal and a budget that makes sense for a city.</p></article>
        <article className="card agency-cap"><span className="agency-cap-num">03</span><h3>A brand people remember</h3><p className="muted">Choosing one message, one look and one voice, then sticking to them.</p></article>
      </div>
      <div className="agency-cta">
        <div><h3>Have a question we should answer?</h3><p className="muted">Send it to us. The best questions become our next notes.</p></div>
        <Link className="btn btn-primary" href="/contact"><ActionIcon name="contact" /> Ask the team</Link>
        <Link className="btn btn-outline" href="/services"><ActionIcon name="services" /> Explore services</Link>
      </div>
    </div>
  </section>;
}
