'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ContactIcon } from '@/components/ContactIcon';
import { EmailBrandIcon, InstagramBrandIcon } from '@/components/MenuBrandIcons';

const LINKS = [
  ['/about', 'About', 'Who we are and how we work'],
  ['/services', 'Services', 'Video, design, creators and Meta Ads'],
  ['/packages', 'Packages', 'Clear monthly plans to start with'],
  ['/portfolio', 'Work', 'Campaigns and content we have made'],
  ['/blog', 'Journal', 'Ideas on content and growth'],
  ['/careers', 'Careers', 'Join a small, focused team'],
  ['/contact', 'Contact', 'Tell us your goals, we reply personally'],
] as const;

function activePath(pathname: string, href: string) {
  if (pathname === href || pathname.startsWith(href + '/')) return true;
  return href === '/packages' && (pathname === '/checkout' || pathname.startsWith('/order/'));
}

export function PublicNavigation({ emailHref = '', whatsappHref = '', instagramHref = '' }: { emailHref?: string; whatsappHref?: string; instagramHref?: string }) {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Single entry point for closing: plays the exit animation, then unmounts the drawer.
  const closeMenu = () => {
    if (!open || closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => { setOpen(false); setClosing(false); }, 200);
  };
  const toggleMenu = () => (open ? closeMenu() : setOpen(true));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenu(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  useEffect(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
    setOpen(false);
    setClosing(false);
  }, [pathname]);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const links = (mobile = false) => LINKS.map(([href, label, desc], index) => {
    const active = activePath(pathname, href);
    const style = mobile ? ({ '--i': index } as CSSProperties) : undefined;
    return <Link key={href} href={href} style={style} className={active ? 'nav-link is-active' : 'nav-link'} aria-current={active ? 'page' : undefined} onClick={mobile ? closeMenu : undefined}>{label}<span className="nav-link-arrow" aria-hidden="true">↗</span>{mobile && <small className="nav-link-desc">{desc}</small>}</Link>;
  });

  return <>
    <div className="public-desktop-navigation">
      <nav className="nav-links nav-desktop" aria-label="Main navigation">{links()}</nav>
      {instagramHref && <a className="header-instagram-action" href={instagramHref} target="_blank" rel="noopener noreferrer" aria-label="Visit Padmaarc on Instagram" title="Instagram"><InstagramBrandIcon /><span>Instagram</span></a>}
      {emailHref && <a className="header-email-action" href={emailHref}><EmailBrandIcon /> Email our team</a>}
    </div>
    <div className={`mobile-menu${open ? ' is-open' : ''}${closing ? ' is-closing' : ''}`}>
      <button className="mobile-menu-trigger" type="button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="mobile-site-navigation" onClick={toggleMenu}><span className="mobile-menu-icon" aria-hidden="true"><i/><i/><i/></span><span>{open ? 'Close' : 'Menu'}</span></button>
      {open && <><button className="mobile-menu-backdrop" type="button" tabIndex={-1} aria-hidden="true" onClick={closeMenu}/><div className="mobile-menu-drawer" id="mobile-site-navigation"><div className="mobile-menu-heading"><span>Explore Padmaarc</span></div><nav aria-label="Mobile navigation">{links(true)}</nav><div className="mobile-menu-actions">{emailHref && <a className="menu-contact-button menu-contact-email" href={emailHref} onClick={closeMenu}><EmailBrandIcon /> Email our team <span aria-hidden="true">↗</span></a>}{whatsappHref && <a className="menu-contact-button menu-contact-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={closeMenu}><ContactIcon name="whatsapp" /> WhatsApp us <span aria-hidden="true">↗</span></a>}{instagramHref && <a className="menu-instagram-link" href={instagramHref} target="_blank" rel="noopener noreferrer" onClick={closeMenu} aria-label="Visit Padmaarc on Instagram"><InstagramBrandIcon /> Instagram <span aria-hidden="true">↗</span></a>}</div></div></>}
    </div>
  </>;
}
