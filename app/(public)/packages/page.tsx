import { listPackages, listMedia } from '@/lib/repo';
import { PackageCard } from '@/components/PackageCard';
import { mediaUrl } from '@/lib/media';
import { SafeImage } from '@/components/SafeImage';
import { ActionIcon } from '@/components/ActionIcon';
import Link from 'next/link';

export default async function PackagesPage() {
  const [pkgs, media] = await Promise.all([listPackages(), listMedia()]);
  return (
    <section className="container section">
      <div className="page-banner"><div><p className="eyebrow">CLEAR PLANS. CREATIVE THAT MOVES.</p><h1>Packages made for steady growth.</h1><p className="lead">Choose a plan, place your order, and we’ll contact you to confirm the details.</p></div><SafeImage className="tilt-card" src={mediaUrl(media, 'packages_main')} alt="Marketing team planning business goals" fetchPriority="high" /></div>
      {pkgs.length === 0 ? (
        <div className="agency-empty">
          <p className="eyebrow">PLANS COMING SOON</p>
          <h2>Our monthly packages are being updated.</h2>
          <p className="muted">Tell us your goal and budget and we will suggest the right starting point while we finish them.</p>
          <div className="actions"><Link className="btn btn-primary" href="/contact"><ActionIcon name="contact" /> Talk to the team</Link></div>
        </div>
      ) : (
        <div className="grid-3">
          {pkgs.map((p) => <PackageCard key={p.id} p={p} />)}
        </div>
      )}
      <div className="agency-cta packages-cta">
        <div><h3>Not sure which plan fits?</h3><p className="muted">Tell us your goal and budget. We will recommend the right starting point.</p></div>
        <Link className="btn btn-primary" href="/contact"><ActionIcon name="contact" /> Get a recommendation</Link>
      </div>
      <p className="muted" style={{ marginTop: 14, fontSize: 13 }}>
        Meta ad spend is paid separately by you to Meta. An agreement is signed when your order is confirmed.
      </p>
    </section>
  );
}
