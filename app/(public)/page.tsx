import Link from 'next/link';
import { getSettings, listPackages, listPortfolio, listMedia } from '@/lib/repo';
import { PackageCard } from '@/components/PackageCard';
import { PortfolioCard } from '@/components/PortfolioCard';
import { EnquiryForm } from '@/components/EnquiryForm';
import { mediaUrl } from '@/lib/media';
import { ActionIcon } from '@/components/ActionIcon';

const SERVICES: [string, string, string][] = [
  ['Videos', 'Short-form videos and ad films built for reach and engagement.', 'home_service_video'],
  ['Posters', 'Clean, eye-catching designs for print and social media.', 'home_service_design'],
  ['Influencers', 'Local creators matched to your audience and goals.', 'home_service_creator'],
  ['Meta Ads', 'Facebook and Instagram campaigns aimed at the right people.', 'home_service_ads'],
];

export default async function Home({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  const [s, pkgs, port, media] = await Promise.all([getSettings(), listPackages(), listPortfolio(true), listMedia()]);
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{s.companyName.toUpperCase()} <span /> {s.address || 'SITAMARHI, BIHAR'}</p>
            <h1>Make your brand <span>impossible to ignore.</span></h1>
            <p className="lead">
              One creative team for scroll-stopping videos, sharp design, local creators and Meta Ads.
              We help ambitious businesses grow across Bihar.
            </p>
            <div className="actions">
              <Link className="btn btn-primary" href="/packages"><ActionIcon name="package" /> Explore packages</Link>
              <Link className="btn btn-outline" href="/contact"><ActionIcon name="contact" /> Talk to our team</Link>
            </div>
            <p className="hero-note">Clear monthly plans · Personal support · Campaigns built around your goals</p>
          </div>
          <div className="hero-visual tilt-card">
            <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={mediaUrl(media, 'home_video_poster')} aria-label="Creative team collaborating in a modern office"><source src={mediaUrl(media, 'home_video')} type="video/mp4" /></video>
            <div className="hero-visual-kicker"><span className="status-pulse" /> PADMAARC / CREATIVE SYSTEMS <span>01—04</span></div>
            <div className="hero-image-caption"><span className="board-dot" /> Strategy, creative and growth <span className="board-mark">P.</span></div>
            <div className="hero-stamp"><strong>Good work.<br/>Real growth.</strong><span>SITAMARHI · BIHAR</span></div>
          </div>
        </div>
        <div className="container hero-capabilities" aria-label="Studio capabilities">
          <span>BRAND STRATEGY</span><i /> <span>VIDEO + DESIGN</span><i /> <span>LOCAL CREATORS</span><i /> <span>PAID SOCIAL</span>
          <Link href="/services">Our capabilities <b aria-hidden="true">↗</b></Link>
        </div>
      </section>

      <div className="ticker" aria-hidden="true"><div className="ticker-track"><span>Brand strategy</span><i/><span>Video production</span><i/><span>Social media</span><i/><span>Performance ads</span><i/><span>Influencer marketing</span><i/><span>Photography</span><i/><span>Meta Ads</span><i/><span>Content writing</span><i/><span>Brand strategy</span><i/><span>Video production</span><i/><span>Social media</span><i/><span>Performance ads</span><i/><span>Influencer marketing</span><i/><span>Photography</span><i/><span>Meta Ads</span><i/><span>Content writing</span><i/></div></div>
      <section id="services" className="section container">
        <div className="section-heading"><p className="eyebrow">ONE TEAM, CONNECTED THINKING</p><h2>Services made to work together.</h2><p>From the first brand idea to the campaign people see in their feed, bring the pieces together with one creative partner.</p></div>
        <div className="grid-4">
          {SERVICES.map(([title, desc, image]) => (
            <div className="card" key={title}>
              <video className="service-image service-video" autoPlay muted loop playsInline preload="none" poster={mediaUrl(media, `${image}_poster`)} aria-label={`${title} in action`}><source src={mediaUrl(media, image)} type="video/mp4" /></video>
              <h3>{title}</h3>
              <p className="muted" style={{ margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
        <p><Link className="service-link" href="/services">Explore all services <span aria-hidden="true">→</span></Link></p>
      </section>

      <section className="section container">
        <div className="section-heading"><p className="eyebrow">CLEAR PLANS. ROOM TO GROW.</p><h2>Choose a package that fits your next step.</h2><p>Compare the monthly deliverables, find a comfortable starting point, and talk with us if you want help choosing.</p></div>
        <div className="grid-3">
          {pkgs.map((p) => <PackageCard key={p.id} p={p} />)}
        </div>
        <p className="muted" style={{ marginTop: 14, fontSize: 13 }}>
          Meta ad spend is paid separately by you to Meta. An agreement is signed when your order is confirmed.
        </p>
      </section>

      <section className="section container studio-section">
        <div className="studio-photo"><video className="studio-video" autoPlay loop controls muted playsInline preload="metadata" poster={mediaUrl(media, 'home_feature_poster')} aria-label="Behind the scenes of a video production"><source src={mediaUrl(media, 'home_feature_video')} type="video/mp4" /></video></div>
        <div><p className="eyebrow">A PARTNER IN YOUR CORNER</p><h2 className="editorial-heading">Creative made for the people you want to reach.</h2><p className="muted">From the first idea to the live campaign, we keep the work clear, collaborative and connected to your business goals.</p><Link className="service-link" href="/about">Get to know us <span aria-hidden="true">→</span></Link></div>
      </section>

      <section className="section container">
        <div className="process-section">
          <div><div className="section-heading"><p className="eyebrow">SIMPLE FROM DAY ONE</p><h2>How it works</h2><p>A clear process keeps your team in the loop from first enquiry through launch.</p></div>
            <ol className="steps">
              <li><strong>Choose a package.</strong> Pick a 1, 3 or 6 month plan.</li>
              <li><strong>Place your order online.</strong> Fill in your business details.</li>
              <li><strong>We contact you.</strong> We confirm the order and share payment details.</li>
              <li><strong>Your campaign goes live.</strong> We handle the content and ads end to end.</li>
            </ol>
          </div>
          <video className="process-video" autoPlay muted loop playsInline preload="none" poster={mediaUrl(media, 'home_process_poster')} aria-label="Video crew setting up a professional shoot"><source src={mediaUrl(media, 'home_process_video')} type="video/mp4" /></video>
        </div>
      </section>

      {port.length > 0 && (
        <section className="section container">
          <div className="section-heading"><p className="eyebrow">MADE WITH INTENTION</p><h2>Recent work</h2><p>A few examples of the creative and campaigns we bring to life with our clients.</p></div>
          <div className="grid-3">
            {port.slice(0, 6).map((i) => <PortfolioCard key={i.id} item={i} />)}
          </div>
        </section>
      )}

      <section id="enquiry" className="section container enquiry-section"><EnquiryForm returnTo="/" searchParams={searchParams} /></section>
    </>
  );
}
