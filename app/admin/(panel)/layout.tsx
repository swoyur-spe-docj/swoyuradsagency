import { DEVELOPER } from '@/lib/credits';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { requireUser } from '@/lib/session-user';
import { navFor, ROLE_LABEL } from '@/lib/roles';
import { logoutAction } from '@/app/actions';
import { AdminNavigation } from '@/components/AdminNavigation';
import { ContactIcon } from '@/components/ContactIcon';
import { BrandMark } from '@/components/BrandMark';
import { publicSiteUrl } from '@/lib/env';

export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const links = navFor(user.role);
  return (
    <div className="admin">
      <aside className="side">
        <Link href="/admin" className="side-brand"><BrandMark width="34" height="34" /><span><strong>Padmaarc</strong><small>STUDIO CONTROL</small></span></Link>
        <AdminNavigation links={links} />
        <a className="side-back" href={publicSiteUrl()} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">←</span> Back to public site</a>
        <form action={logoutAction}>
          <button className="btn btn-outline btn-sm" type="submit">Logout</button>
        </form>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><div className="admin-breadcrumb"><span>Workspace</span><b>›</b><strong>Studio control</strong></div><div className="admin-toolbar"><Link className="admin-icon-button" href="/admin/enquiries" aria-label="View enquiries" title="View enquiries"><ContactIcon name="bell" /></Link><details className="admin-profile"><summary><span className="admin-avatar">P</span><span className="admin-profile-copy"><strong>{user.name}</strong><small>{ROLE_LABEL[user.role]}</small></span><span className="admin-profile-chevron" aria-hidden="true">⌄</span></summary><div className="admin-profile-menu"><Link href="/admin/settings">Workspace settings <span aria-hidden="true">↗</span></Link><a href={publicSiteUrl()} target="_blank" rel="noopener noreferrer">Open public website <span aria-hidden="true">↗</span></a></div></details></div></header>
        <div className="admin-content">{children}</div>
        {DEVELOPER.name && (
          <footer className="admin-credit">
            <span>Designed and built by <strong>{DEVELOPER.name}</strong></span>
            {DEVELOPER.url && <a href={DEVELOPER.url} target="_blank" rel="noopener noreferrer">Visit ↗</a>}
          </footer>
        )}
        <footer className="admin-footer"><span><strong>PADMAARC STUDIO CONTROL</strong><small>Private workspace · Manage your studio operations</small></span><Link href="/admin/settings">Settings <span aria-hidden="true">↗</span></Link></footer>
      </div>
    </div>
  );
}
