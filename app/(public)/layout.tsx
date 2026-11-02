import Link from 'next/link';
import type { ReactNode } from 'react';
import { getSettings } from '@/lib/repo';
import { waLink } from '@/lib/whatsapp';
import { DEFAULT_SITE_CONTACT, emailHref } from '@/lib/site-contact';
import { socialUrl } from '@/lib/social';
import { PublicNavigation } from '@/components/PublicNavigation';
import { PageFooter } from '@/components/PageFooter';
import { BackToHome } from '@/components/BackToHome';
import { BrandMark } from '@/components/BrandMark';
import { WhatsAppFloat, MobileCta } from '@/components/QuickContact';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const s = await getSettings();
  const whatsapp = waLink(s.whatsapp, 'Hi Padmaarc team, I would like to know more about your services.');
  const instagram = socialUrl('instagram', s.instagram || DEFAULT_SITE_CONTACT.instagram);
  const email = emailHref(s.email, `A question for ${s.companyName}`, 'Hi Padmaarc team,\n\nI would like to know more about your services.\n\n');
  return (
    <>
      <header id="top" className="site-header">
        <div className="nav">
          <Link href="/" className="brand"><BrandMark className="brand-logo" width="34" height="34" /> <span>{s.companyName.toUpperCase()}</span></Link>
          <PublicNavigation emailHref={email} whatsappHref={whatsapp} instagramHref={instagram} />
        </div>
      </header>
      <BackToHome />
      <main>{children}</main>
      <WhatsAppFloat number={s.whatsapp} />
      <MobileCta phone={s.phone} whatsapp={s.whatsapp} />
      <PageFooter settings={{ companyName: s.companyName, address: s.address, phone: s.phone, whatsapp: s.whatsapp, email: s.email, instagram: s.instagram, facebook: s.facebook, linkedin: s.linkedin, youtube: s.youtube }} />
    </>
  );
}
