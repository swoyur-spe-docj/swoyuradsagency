// Lists current hiring information without fabricating open roles.
// Applicants can contact the agency directly until applications are connected to the CMS.
import { getSettings, listMedia } from '@/lib/repo';
import { mediaUrl } from '@/lib/media';
import { emailHref } from '@/lib/site-contact';
import { SafeImage } from '@/components/SafeImage';

export default async function CareersPage() {
  const [settings, media] = await Promise.all([getSettings(), listMedia()]);
  const email = emailHref(settings.email, 'Future opportunities at Padmaarc', 'Hi Padmaarc team,\n\nI would like to be considered for future opportunities.\n\nA little about me:\n');
  return <section className="section container">
    <div className="page-banner compact"><div><p className="eyebrow">CAREERS · WORK WITH US</p><h1>Good work comes from curious people.</h1></div><SafeImage className="tilt-card" src={mediaUrl(media, 'careers_main')} alt="Collaborative creative team" fetchPriority="high" /></div>
    <div className="agency-empty">
      <p className="eyebrow">OPEN ROLES</p>
      <h2>No open positions right now.</h2>
      <p className="muted">We are not hiring for a specific role today. Strong people still get noticed, so send a short introduction {email ? <>to <a href={email}>{settings.email}</a>.</> : 'through our contact page.'}</p>
      <div className="agency-capabilities">
        <article className="card agency-cap"><span className="agency-cap-num">01</span><h3>Small, focused team</h3><p className="muted">You work directly with clients and see your ideas go live.</p></article>
        <article className="card agency-cap"><span className="agency-cap-num">02</span><h3>Real ownership</h3><p className="muted">Video, design and ads are made by people who care about results.</p></article>
        <article className="card agency-cap"><span className="agency-cap-num">03</span><h3>Learn in public</h3><p className="muted">Campaign data, creative tests and feedback shape how we grow.</p></article>
      </div>
    </div>
  </section>;
}
