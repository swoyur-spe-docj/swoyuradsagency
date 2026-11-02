import Link from 'next/link';
import { dashboardStats, listOrders, getSettings } from '@/lib/repo';
import { CLIENT_WISH, wishFor } from '@/lib/credits';
import { fmtDate, inr } from '@/lib/format';
import { StatusBadge, Stat, Empty, Notice } from '@/components/ui';
import { requireUser } from '@/lib/session-user';
import { RoleHome } from '@/components/RoleHome';

export default async function Dashboard({ searchParams }: { searchParams: { error?: string } }) {
  const user = await requireUser();
  if (user.role === 'designer' || user.role === 'editor') return <RoleHome user={user} />;
  const [st, latest, settings] = await Promise.all([dashboardStats(), listOrders({ page: 1 }), getSettings()]);
  return (
    <>
      <Notice error={searchParams.error} />
      <aside className="wish-card" aria-label="Message for the team">
        <p className="eyebrow">A NOTE FOR THE TEAM</p>
        <h2>{CLIENT_WISH.title}</h2>
        <p>{wishFor(settings.companyName)}</p>
      </aside>
      <div className="dashboard-welcome"><div><p className="eyebrow">YOUR STUDIO AT A GLANCE</p><h1>Good to see you.</h1><p className="muted">A live view of your orders, clients and new conversations.</p></div><div className="actions"><Link className="btn btn-primary" href="/admin/orders">Manage orders →</Link><Link className="btn btn-outline" href="/admin/enquiries">View enquiries</Link></div></div>
      <div className="stats">
        <Stat label="New orders" value={st.newOrders} />
        <Stat label="Awaiting payment" value={st.awaiting} />
        <Stat label="Revenue this month" value={inr(st.revenue)} />
        <Stat label="Active clients" value={st.activeClients} />
        <Stat label="New enquiries" value={st.newEnquiries} />
      </div>

      <div className="grid-2">
        <section className="card">
          <h2>Alerts</h2>
          <ul className="list" style={{ color: 'var(--text)' }}>
            {st.expiring.map((r) => (
              <li key={r.cp.id}>Package ends on {fmtDate(r.cp.endDate)}: {r.client?.name} ({r.cp.packageName})</li>
            ))}
            {st.quotaFull.map((r) => (
              <li key={r.cp.id}>Quota full or nearly full: {r.client?.name} ({r.cp.packageName})</li>
            ))}
            {st.stale.map((o) => (
              <li key={o.id}>Order {o.orderNumber} waiting more than 24 hours</li>
            ))}
          </ul>
          {st.expiring.length + st.quotaFull.length + st.stale.length === 0 && <Empty text="No alerts right now." />}
        </section>

        <section className="card">
          <h2>Latest orders</h2>
          {latest.rows.length === 0 ? (
            <Empty text="No orders yet." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order</th><th>Customer</th><th>Status</th></tr></thead>
                <tbody>
                  {latest.rows.slice(0, 10).map((o) => (
                    <tr key={o.id}>
                      <td><Link href={`/admin/orders/${o.id}`}>{o.orderNumber}</Link></td>
                      <td>{o.customerName}<br /><span className="muted">{o.snapshot.name}</span></td>
                      <td><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
