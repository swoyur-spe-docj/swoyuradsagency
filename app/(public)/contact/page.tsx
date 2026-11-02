import Link from 'next/link';
import { getSettings, listMedia } from '@/lib/repo';
import { EnquiryForm } from '@/components/EnquiryForm';
import { SocialLinks } from '@/components/SocialLinks';
import { ContactIcon } from '@/components/ContactIcon';
import { mediaUrl } from '@/lib/media';
import { configuredSocialLinks, emailHref, phoneHref } from '@/lib/site-contact';
import { waLink } from '@/lib/whatsapp';
import { SafeImage } from '@/components/SafeImage';

export default async function ContactPage({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  const [s, media] = await Promise.all([getSettings(), listMedia()]);
  const socials = configuredSocialLinks(s);
  const phone = phoneHref(s.phone);
  const email = emailHref(s.email, `Project enquiry for ${s.companyName}`, 'Hi Padmaarc team,\n\nI would like to discuss a project.\n\nHere are a few details:\n');
  const whatsapp = waLink(s.whatsapp, 'Hi Padmaarc team, I would like to discuss a project.');
  const location = s.address || 'Sitamarhi, Bihar';
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  return <>
    <section className="contact-hero"><div className="container contact-hero-grid"><div><p className="eyebrow">WE’RE EASY TO REACH <span /> {location.toUpperCase()}</p><h1>Good things start with a conversation.</h1><p className="lead">Tell us what you’re building, who you want to reach, and what you hope to change. We’ll listen first, then help you find a clear next step.</p><div className="actions">{phone && <a className="btn btn-primary" href={phone}><ContactIcon name="phone" /> Call the studio <span aria-hidden="true">↗</span></a>}{email && <a className="btn btn-outline" href={email}><ContactIcon name="mail" /> Email our team</a>}</div><p className="contact-response-note">No pressure, no obligation—just a real conversation about your goals.</p></div><SafeImage className="tilt-card" src={mediaUrl(media, 'contact_main')} alt="Welcoming creative studio workspace" fetchPriority="high" /></div></section>
    <section className="container section contact-content"><aside className="contact-aside"><p className="eyebrow">CONTACT DETAILS</p><h2>Choose the way that works for you.</h2><p className="muted contact-aside-copy">Call, send a WhatsApp, or leave a few details in the form. We’ll get back to you and take it from there.</p>
      {phone && <div className="contact-method"><span><ContactIcon name="phone" /> PHONE</span><a href={phone}>{s.phone}</a>{whatsapp && <a className="muted contact-action-link" href={whatsapp} target="_blank" rel="noopener noreferrer"><ContactIcon name="whatsapp" /> Message us on WhatsApp <span aria-hidden="true">↗</span></a>}</div>}
      {email && <div className="contact-method"><span><ContactIcon name="mail" /> EMAIL</span><a href={email}>{s.email}</a><small>For project enquiries and general questions.</small></div>}
      <div className="contact-method"><span><ContactIcon name="pin" /> LOCATION</span><strong>{location}</strong><small>Serving businesses across Bihar and beyond.</small><a className="contact-action-link" href={map} target="_blank" rel="noopener noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a></div>
      {socials.length > 0 && <div className="contact-method"><span>FOLLOW ALONG</span><SocialLinks links={socials} className="social-links icon-socials" /></div>}
      <a className="location-map" href={map} target="_blank" rel="noopener noreferrer"><span className="location-map-mark"><ContactIcon name="pin" /></span><span className="location-map-copy"><strong>Find the studio</strong><small>{location} · Bihar, India</small></span><span className="location-map-arrow" aria-hidden="true">↗</span></a><Link href="/services" className="service-link">Explore our services →</Link>
    </aside><div id="enquiry"><EnquiryForm searchParams={searchParams} /></div></section>
  </>;
}
