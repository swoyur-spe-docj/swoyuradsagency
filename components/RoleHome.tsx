import Link from 'next/link';
import { listAssignedOrders } from '@/lib/repo';
import { ROLE_LABEL } from '@/lib/roles';
import type { CurrentUser } from '@/lib/session-user';
import { StatusBadge, Empty } from '@/components/ui';

/** Home screen for designers and editors: their own work, not the whole studio. */
export async function RoleHome({ user }: { user: CurrentUser }) {
  if (user.role === 'designer') {
    const orders = await listAssignedOrders(user.id);
    const open = orders.filter((order) => order.status !== 'completed' && order.status !== 'cancelled');
    return (
      <>
        <div className="dashboard-welcome"><div><p className="eyebrow">{ROLE_LABEL[user.role].toUpperCase()} WORKSPACE</p><h1>Hello, {user.name.split(' ')[0]}.</h1><p className="muted">Here is the work assigned to you.</p></div></div>
        <div className="stats">
          <div className="stat"><span>Open orders</span><b>{open.length}</b></div>
          <div className="stat"><span>All assigned</span><b>{orders.length}</b></div>
        </div>
        <section className="card">
          <h2>Next up</h2>
          {open.length === 0 ? <Empty text="Nothing open right now. Enjoy the calm." /> : (
            <ul className="task-list">
              {open.slice(0, 5).map((order) => (
                <li key={order.id}><Link href={`/admin/orders/${order.id}`}><strong>{order.business || order.customerName}</strong><small>{order.orderNumber} · {order.goal || 'No goal noted'}</small></Link><StatusBadge status={order.status} /></li>
              ))}
            </ul>
          )}
          <p><Link className="service-link" href="/admin/tasks">See all my tasks →</Link></p>
        </section>
      </>
    );
  }
  return (
    <>
      <div className="dashboard-welcome"><div><p className="eyebrow">{ROLE_LABEL[user.role].toUpperCase()} WORKSPACE</p><h1>Hello, {user.name.split(' ')[0]}.</h1><p className="muted">Keep the website fresh: portfolio and media are yours to update.</p></div></div>
      <div className="grid-2">
        <Link className="card role-tile" href="/admin/portfolio"><h2>Portfolio</h2><p className="muted">Add and arrange the work shown on the website.</p><span className="service-link">Open portfolio →</span></Link>
        <Link className="card role-tile" href="/admin/media"><h2>Media library</h2><p className="muted">Upload images and videos for the website.</p><span className="service-link">Open media library →</span></Link>
      </div>
    </>
  );
}
