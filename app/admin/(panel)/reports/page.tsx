import { countBy, revenueByMonth } from '@/lib/repo';
import { inr } from '@/lib/format';
import { STATUS_LABEL } from '@/components/ui';
import type { OrderStatus } from '@/lib/types';
import { Empty } from '@/components/ui';
import { requirePermission } from '@/lib/session-user';

export default async function ReportsPage() {
  await requirePermission('reports');
  const [months, byStatus, byPackage] = await Promise.all([
    revenueByMonth(),
    countBy('status'),
    countBy('package'),
  ]);
  return (
    <>
      <h1>Reports</h1>
      <p><a className="btn btn-primary btn-sm" href="/admin/reports/csv">Download orders (CSV)</a></p>
      <div className="grid-2">
        <section className="card">
          <h2>Revenue by month</h2>
          {months.length === 0 ? <Empty text="No payments yet." /> : (
            <table>
              <thead><tr><th>Month</th><th className="r">Revenue</th></tr></thead>
              <tbody>{months.map(([m, v]) => <tr key={m}><td>{m}</td><td className="r">{inr(v)}</td></tr>)}</tbody>
            </table>
          )}
        </section>
        <section className="card">
          <h2>Orders by status</h2>
          {byStatus.length === 0 ? <Empty text="No orders yet." /> : (
            <table>
              <thead><tr><th>Status</th><th className="r">Orders</th></tr></thead>
              <tbody>{byStatus.map(([s, n]) => <tr key={s}><td>{STATUS_LABEL[s as OrderStatus]}</td><td className="r">{n}</td></tr>)}</tbody>
            </table>
          )}
          <h2 style={{ marginTop: 18 }}>Orders by package</h2>
          {byPackage.length === 0 ? <Empty text="No orders yet." /> : (
            <table>
              <thead><tr><th>Package</th><th className="r">Orders</th></tr></thead>
              <tbody>{byPackage.map(([p, n]) => <tr key={p}><td>{p}</td><td className="r">{n}</td></tr>)}</tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
