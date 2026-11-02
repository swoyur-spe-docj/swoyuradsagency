// Presents Padmaarc's agency story, approach, and operating location.
// Content stays grounded in the business information configured by the admin.
import Link from 'next/link';
import { getSettings, listMedia } from '@/lib/repo';
import { mediaUrl } from '@/lib/media';
import { waLink } from '@/lib/whatsapp';
import { configuredSocialLinks, emailHref, phoneHref } from '@/lib/site-contact';
import { SocialLinks } from '@/components/SocialLinks';
import { ContactIcon } from '@/components/ContactIcon';
import { ActionIcon } from '@/components/ActionIcon';
import { SafeImage } from '@/components/SafeImage';

export default async function AboutPage() {
  const [settings, media] = await Promise.all([getSettings(), listMedia()]);
  const socials = configuredSocialLinks(settings);
  const email = emailHref(settings.email, `A question for ${settings.companyName}`, 'Hi Padmaarc team,\n\nI would like to discuss a project.\n\n');
  const phone = phoneHref(settings.phone);
  return (
    <>
      <section className="section container about-hero page-hero-grid">
        <div>
        <p className="eyebrow">ABOUT THE STUDIO <span /> {settings.address.toUpperCase()}</p>
        <h1 className="editorial-heading">Good marketing makes a business easier to remember.</h1>
        <p className="lead">{settings.companyName} is an independent creative and advertising studio based in {settings.address}. We bring content, design, creators and paid social together in one clear monthly plan.</p>
        <p><Link className="btn btn-primary" href="/contact"><ActionIcon name="contact" /> Tell us about your business</Link></p>
        </div>
        <SafeImage className="tilt-card" src={mediaUrl(media, 'about_main')} alt="Bright, collaborative studio workspace" fetchPriority="high" />
      </section>
      <section className="section container">
        <p className="eyebrow">HOW WE WORK <span /> 01—03</p>
        <div className="grid-3">
          <article className="card image-card tilt-card"><SafeImage src={mediaUrl(media, 'about_strategy')} alt="Team discussing business goals" loading="lazy"/><p className="service-number">01</p><h2>Start with the business</h2><p className="muted">We learn what you offer, who you want to reach and what a useful result looks like.</p></article>
          <article className="card image-card tilt-card"><SafeImage src={mediaUrl(media, 'about_creative')} alt="Creative team shaping a campaign" loading="lazy"/><p className="service-number">02</p><h2>Make the work coherent</h2><p className="muted">Video, design and advertising follow one direction so every part of a campaign supports the same message.</p></article>
          <article className="card image-card tilt-card"><SafeImage src={mediaUrl(media, 'about_delivery')} alt="Team collaborating on campaign delivery" loading="lazy"/><p className="service-number">03</p><h2>Stay close to delivery</h2><p className="muted">A real team contact keeps approvals, updates and next steps clear through the campaign.</p></article>
        </div>
      </section>
      <section className="section container">
        <div className="card about-location"><div><p className="eyebrow">LOCAL ROOTS <span /> BIHAR</p><h2>From Sitamarhi, for ambitious local businesses.</h2><p className="muted">We work with businesses that want consistent creative and practical advertising support.</p></div><Link className="btn btn-outline" href="/packages"><ActionIcon name="package" /> See monthly packages</Link></div>
      </section>
      <section className="section container about-contact"><div><p className="eyebrow">TALK TO THE TEAM</p><h2>We’re ready when you are.</h2><p className="muted">Call, email or message us to start planning your next campaign.</p></div><div className="about-contact-links">{phone && <a href={phone}><ContactIcon name="phone" /><span>PHONE</span>{settings.phone}</a>}{email && <a href={email}><ContactIcon name="mail" /><span>EMAIL</span>{settings.email}</a>}{waLink(settings.whatsapp, 'Hi Padmaarc team, I would like to discuss a project.') && <a href={waLink(settings.whatsapp, 'Hi Padmaarc team, I would like to discuss a project.')} target="_blank" rel="noopener noreferrer"><ContactIcon name="whatsapp" /><span>WHATSAPP</span>Message the team ↗</a>}{socials.length > 0 && <SocialLinks links={socials} className="social-links icon-socials" />}</div></section>
    </>
  );
}
