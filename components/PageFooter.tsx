'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Settings } from '@/lib/types';
import { emailHref, phoneHref, configuredSocialLinks } from '@/lib/site-contact';
import { waLink } from '@/lib/whatsapp';
import { SocialLinks } from '@/components/SocialLinks';
import { ContactIcon } from '@/components/ContactIcon';
import { ActionIcon } from '@/components/ActionIcon';
import { EmailBrandIcon } from '@/components/MenuBrandIcons';
import { BrandMark } from '@/components/BrandMark';

const FOOTERS = {
  home: { highlights: [['Packages', 'Clear monthly plans', '/packages'], ['Our work', 'Campaigns we have made', '/portfolio'], ['Start a project', 'Tell us your goals', '/contact']], focus: 'We bring strategy, design, video and paid campaigns together, so your brand is seen and remembered.', eyebrow: 'MAKE YOUR NEXT MOVE', title: 'Ready to grow with intention?', copy: 'Let’s turn a good idea into a clear plan for your brand.', action: 'Start a conversation', href: '/contact', links: [['Services', '/services'], ['Our work', '/portfolio'], ['Packages', '/packages']] },
  about: { highlights: [['How we work', 'Our approach, step by step', '/services'], ['Meet the team', 'Say hello', '/contact'], ['Careers', 'Join a focused team', '/careers']], focus: 'A Sitamarhi-based team that treats every brand as a long-term partner, not a one-off job.', eyebrow: 'WORK WITH PADMAARC', title: 'Let’s make your brand easier to remember.', copy: 'Bring us your next challenge and we’ll talk through it together.', action: 'Meet the team', href: '/contact', links: [['Our approach', '/about'], ['Services', '/services'], ['Our work', '/portfolio']] },
  services: { highlights: [['Compare packages', 'Plans from one month', '/packages'], ['See the work', 'Recent campaigns', '/portfolio'], ['Ask a question', 'We reply personally', '/contact']], focus: 'Video, design, creators and Meta Ads, planned together so each piece supports the next.', eyebrow: 'FIND YOUR STARTING POINT', title: 'The right creative mix starts with a real conversation.', copy: 'Explore the ways we can help your brand connect with the right people.', action: 'Compare packages', href: '/packages', links: [['Brand strategy', '/services#service-1'], ['Digital marketing', '/services#service-2'], ['Video production', '/services#service-5']] },
  contact: { highlights: [['Services', 'What we can build for you', '/services'], ['Packages', 'Plans and deliverables', '/packages'], ['Journal', 'Ideas for your brand', '/blog']], focus: 'Tell us your goals. We reply personally and help you find the right next step.', eyebrow: 'KEEP EXPLORING', title: 'A little more about what we do.', copy: 'See the services we bring together for growing brands.', action: 'Explore services', href: '/services', links: [['Packages', '/packages'], ['Our work', '/portfolio'], ['About us', '/about']] },
  packages: { highlights: [['Not sure which?', 'Talk to us first', '/contact'], ['Services', 'Every service explained', '/services'], ['Our work', 'Results-driven creative', '/portfolio']], focus: 'Clear monthly plans with defined deliverables, so you always know what you are getting.', eyebrow: 'NEED A HAND?', title: 'Not sure which plan fits?', copy: 'Tell us about your goals and we’ll help you choose a practical next step.', action: 'Ask our team', href: '/contact', links: [['Services', '/services'], ['Recent work', '/portfolio'], ['How we work', '/about']] },
  portfolio: { highlights: [['Start a similar project', 'Tell us what you need', '/contact'], ['Packages', 'Choose a monthly plan', '/packages'], ['Services', 'Video, design, Meta Ads', '/services']], focus: 'A look at the campaigns, videos and designs we have made for growing businesses.', eyebrow: 'YOUR PROJECT, NEXT', title: 'Have something in mind?', copy: 'Tell us what you want to build and who you want to reach.', action: 'Discuss your project', href: '/contact', links: [['Services', '/services'], ['Packages', '/packages'], ['About us', '/about']] },
  blog: { highlights: [['Services', 'Put ideas into action', '/services'], ['Packages', 'Plans to grow', '/packages'], ['Contact', 'Ask us anything', '/contact']], focus: 'Practical notes on content, advertising and building a brand people remember.', eyebrow: 'PUT IDEAS TO WORK', title: 'Good ideas deserve good execution.', copy: 'See how our creative and campaign services can help your brand.', action: 'Explore services', href: '/services', links: [['Services', '/services'], ['Our work', '/portfolio'], ['Contact', '/contact']] },
  careers: { highlights: [['Our work', 'See what we make', '/portfolio'], ['Get in touch', 'Send us a note', '/contact'], ['About us', 'Who we are', '/about']], focus: 'A small, focused team that cares about craft, clear communication and real results.', eyebrow: 'STAY IN TOUCH', title: 'Good things grow through connection.', copy: 'We are not listing open roles today. Send a note if you would like to stay connected.', action: 'Contact Padmaarc', href: '/contact', links: [['About us', '/about'], ['Our work', '/portfolio'], ['Journal', '/blog']] },
  checkout: { highlights: [['Packages', 'Review the plan again', '/packages'], ['Services', 'What is included', '/services'], ['Contact', 'Ask before you pay', '/contact']], focus: 'Your order is confirmed after a short conversation with our team about payment.', eyebrow: 'A CLEAR NEXT STEP', title: 'Questions before you place your order?', copy: 'Talk with our team about the package details before continuing.', action: 'Ask the team', href: '/contact', links: [['Browse packages', '/packages'], ['How it works', '/services'], ['Contact', '/contact']] },
  order: { highlights: [['Browse services', 'Explore more', '/services'], ['Packages', 'Plans for next month', '/packages'], ['Contact', 'Get help with your order', '/contact']], focus: 'Track your order here. Reach out any time with questions about your package.', eyebrow: 'HERE TO HELP', title: 'Need help with your order?', copy: 'Our team can help with order questions and next steps.', action: 'Get in touch', href: '/contact', links: [['Browse services', '/services'], ['View packages', '/packages'], ['Contact', '/contact']] },
} as const;

const SERVICE_CHIPS = ['Strategy', 'Design', 'Video', 'Influencers', 'Meta Ads'] as const;

function variantFor(pathname: string): keyof typeof FOOTERS {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/order/')) return 'order';
  if (pathname === '/checkout') return 'checkout';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/services')) return 'services';
  if (pathname.startsWith('/contact')) return 'contact';
  if (pathname.startsWith('/packages')) return 'packages';
  if (pathname.startsWith('/portfolio')) return 'portfolio';
  if (pathname.startsWith('/blog')) return 'blog';
  if (pathname.startsWith('/careers')) return 'careers';
  return 'home';
}

export function PageFooter({ settings }: { settings: Pick<Settings, 'companyName' | 'address' | 'phone' | 'whatsapp' | 'email' | 'instagram' | 'facebook' | 'linkedin' | 'youtube'> }) {
  const pathname = usePathname() || '/';
  const variant = variantFor(pathname);
  const content = FOOTERS[variant];
  const socialLinks = configuredSocialLinks(settings);
  const phone = phoneHref(settings.phone);
  const email = emailHref(settings.email, `A question for ${settings.companyName}`, 'Hi Padmaarc team,\n\nI would like to know more about your services.\n\n');
  const whatsapp = waLink(settings.whatsapp, 'Hi Padmaarc team, I would like to know more about your services.');

  return <footer className={`site-footer site-footer-${variant}`} data-footer-variant={variant}>
    <div className="container footer-intro"><div><p className="eyebrow">{content.eyebrow}</p><h2>{content.title}</h2><p>{content.copy}</p></div><Link href={content.href} className="btn btn-primary"><ActionIcon name="arrow" /> {content.action}</Link></div>
    <div className="container footer-highlights" aria-label="Explore next">{content.highlights.map(([title, desc, href], i) => <Link key={href} href={href} className="footer-highlight" style={{ animationDelay: `${i * 0.08}s` }}><span className="footer-highlight-index">0{i + 1}</span><span><strong>{title}</strong><small>{desc}</small></span><span className="footer-highlight-arrow" aria-hidden="true">→</span></Link>)}</div>
    <div className="container footer-grid">
      <div className="footer-about"><Link href="/" className="footer-brand" aria-label="Padmaarc home"><span className="footer-logo"><BrandMark width={44} height={44} /></span><span className="footer-wordmark"><strong>{settings.companyName}</strong><small>Creative and performance studio</small></span></Link><p className="footer-focus">{content.focus}</p><ul className="footer-chips" aria-label="What we do">{SERVICE_CHIPS.map((c) => <li key={c}>{c}</li>)}</ul><a className="footer-location" href="https://www.google.com/maps/search/?api=1&query=Sitamarhi%2C%20Bihar" target="_blank" rel="noopener noreferrer"><ContactIcon name="pin" />{settings.address || 'Sitamarhi, Bihar'} <span aria-hidden="true">↗</span></a></div>
      <div><h3>For this next step</h3><nav className="footer-nav">{content.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav></div>
      <div className="footer-contact"><h3>Talk with the team</h3><nav className="footer-nav footer-contact-nav">{phone && <a href={phoneHref(settings.phone)}><ContactIcon name="phone" />{settings.phone}</a>}{email && <a href={email}><EmailBrandIcon />{settings.email}</a>}{whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer"><ContactIcon name="whatsapp" />WhatsApp us <span aria-hidden="true">↗</span></a>}<Link href="/contact"><ContactIcon name="pin" />Contact details & map <span aria-hidden="true">↗</span></Link></nav><h3 className="footer-follow-title">Follow along</h3>{socialLinks.length > 0 && <SocialLinks links={socialLinks} className="footer-socials" />}</div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} {settings.companyName}. All rights reserved.</span><span>Independent creative studio · Sitamarhi, Bihar</span><a href="#top" className="back-to-top">Back to top ↑</a></div>
  </footer>;
}
