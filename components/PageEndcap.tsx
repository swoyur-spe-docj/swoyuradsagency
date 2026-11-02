'use client';

import Link from 'next/link';
import { ActionIcon } from '@/components/ActionIcon';
import { usePathname } from 'next/navigation';

const ENDCAPS: Record<string, { eyebrow: string; title: string; description: string; label: string; href: string }> = {
  '/': { eyebrow: 'MAKE YOUR NEXT MOVE', title: 'Ready to grow with intention?', description: 'Let’s turn a good idea into a clear plan for your brand.', label: 'Start a conversation', href: '/contact' },
  '/about': { eyebrow: 'WORK WITH PADMAARC', title: 'Let’s make your brand easier to remember.', description: 'Bring us your next challenge and we’ll talk through it together.', label: 'Contact the studio', href: '/contact' },
  '/services': { eyebrow: 'FIND YOUR STARTING POINT', title: 'The right creative mix starts with a real conversation.', description: 'Compare our monthly plans or tell us what your business needs.', label: 'Explore packages', href: '/packages' },
  '/packages': { eyebrow: 'NEED A HAND?', title: 'Not sure which plan fits?', description: 'Tell us about your goals and we’ll help you choose a practical next step.', label: 'Ask our team', href: '/contact' },
  '/portfolio': { eyebrow: 'YOUR PROJECT, NEXT', title: 'Have something in mind?', description: 'Tell us what you want to build and who you want to reach.', label: 'Discuss your project', href: '/contact' },
  '/blog': { eyebrow: 'PUT IDEAS TO WORK', title: 'Good ideas deserve good execution.', description: 'See how our creative and campaign services can help your brand.', label: 'Explore services', href: '/services' },
  '/careers': { eyebrow: 'STAY IN TOUCH', title: 'Good things grow through connection.', description: 'Follow our work or send us a note about future opportunities.', label: 'Contact Padmaarc', href: '/contact' },
  '/contact': { eyebrow: 'KEEP EXPLORING', title: 'A little more about what we do.', description: 'See the services we bring together for growing brands.', label: 'Explore services', href: '/services' },
};

export function PageEndcap() {
  const pathname = usePathname() || '/';
  const content = ENDCAPS[pathname] || ENDCAPS['/'];
  return <footer className="page-endcap" aria-label="Page-specific next step"><div className="container page-endcap-inner"><div><p className="eyebrow">{content.eyebrow}</p><h2>{content.title}</h2><p>{content.description}</p></div><Link href={content.href} className="btn btn-primary"><ActionIcon name="arrow" /> {content.label}</Link></div></footer>;
}
