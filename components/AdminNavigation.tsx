'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

const ICON_PATHS: Record<string, string> = {
  '/admin': 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  '/admin/tasks': 'M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01',
  '/admin/orders': 'M6 3h12l3 3v15H3V3h3z M6 8h12 M8 12h8 M8 16h5',
  '/admin/clients': 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 8v6 M23 11h-6',
  '/admin/enquiries': 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z',
  '/admin/packages': 'M12 22V12 M3.1 6.5 12 2l8.9 4.5v11L12 22l-8.9-4.5z M3.1 6.5 12 11l8.9-4.5 M7.5 4.3l9 4.6',
  '/admin/portfolio': 'M3 5h18v14H3z M8 5V3h8v2 M3 15l5-5 4 4 3-3 6 6',
  '/admin/media': 'M3 5h18v14H3z M10 9l5 3-5 3z',
  '/admin/meta-ads': 'M4 19V5 M4 19h17 M8 15l4-5 3 2 5-7',
  '/admin/reports': 'M4 19V9 M10 19V5 M16 19v-7 M22 19H2',
  '/admin/team': 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 8v6 M23 11h-6',
  '/admin/settings': 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 2.9-.2-.1a1.7 1.7 0 0 0-1.9.3l-.1.1h-3.4l-.1-.2a1.7 1.7 0 0 0-1.6-1l-.3.1-2.9-1.7.1-.2a1.7 1.7 0 0 0-.3-1.9l-.1-.1v-3.4l.2-.1a1.7 1.7 0 0 0 1-1.6l-.1-.3 1.7-2.9.2.1a1.7 1.7 0 0 0 1.9-.3l.1-.1h3.4l.1.2a1.7 1.7 0 0 0 1.6 1l.3-.1 2.9 1.7-.1.2a1.7 1.7 0 0 0 .3 1.9l.1.1v3.4z',
};


export function AdminNavigation({ links: allowed }: { links: ReadonlyArray<readonly [string, string]> }) {
  const pathname = usePathname() || '/admin';
  const menu = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => { if (menu.current) menu.current.open = false; };
  const links = (mobile = false) => allowed.map(([href, label]) => {
    const active = href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(href + '/');
    return (
      <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={active ? 'is-active' : undefined} onClick={mobile ? closeMenu : undefined}>
        <span className="admin-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false"><path d={ICON_PATHS[href] || ICON_PATHS['/admin']} /></svg></span>
        <span className="admin-nav-label">{label}</span>
        <span className="admin-nav-arrow" aria-hidden="true">↗</span>
      </Link>
    );
  });

  return (
    <>
      <nav className="admin-desktop-nav" aria-label="Admin sections">{links()}</nav>
      <details ref={menu} className="admin-mobile-menu">
        <summary aria-label="Open admin sections"><span className="hamburger" aria-hidden="true"><i /><i /><i /></span><span>Sections</span></summary>
        <button type="button" className="admin-mobile-backdrop" aria-label="Close admin sections" onClick={closeMenu} />
        <nav aria-label="Admin sections">
          <div className="admin-mobile-nav-heading">
            <strong>Workspace sections</strong>
            <button type="button" className="admin-mobile-close" aria-label="Close sections menu" onClick={closeMenu}>×</button>
          </div>
          {links(true)}
        </nav>
      </details>
    </>
  );
}
