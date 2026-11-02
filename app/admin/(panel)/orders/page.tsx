import Link from 'next/link';
import { listOrders } from '@/lib/repo';
import { inr, fmtDate } from '@/lib/format';
import { StatusBadge, Empty, STATUS_LABEL } from '@/components/ui';
import type { OrderStatus } from '@/lib/types';
import { requirePermission } from '@/lib/session-user';

export default async function OrdersPage({ searchParams }: { searchParams: { status?: string; q?: string; page?: string } }) {
  await requirePermission('orders');
  const status = searchParams.status || 'all';
  const q = searchParams.q || '';
  // Guard against ?page=abc or negative pages, which would otherwise produce NaN or an empty result.
  const parsedPage = Number.parseInt(searchParams.page || '1', 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const res = await listOrders({ status, q, page });
  const qs = (p: number) => `/admin/orders?status=${status}&q=${encodeURIComponent(q)}&page=${p}`;

  return (
    <>
      <h1>Orders</h1>
      <form className="inline" method="GET" style={{ marginBottom: 16 }}>
        <label>Status
          <select name="status" defaultValue={status}>
            <option value="all">All</option>
            {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>
        <label>Search (order no, name or mobile)<input name="q" defaultValue={q} /></label>
        <div><button className="btn btn-primary btn-sm" type="submit">Filter</button></div>
      </form>

      {res.rows.length === 0 ? (
        <Empty text="No orders match this filter." />
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th><th>Date</th><th>Customer</th><th>Package</th>
                <th className="r">Price</th><th className="r">Paid</th><th className="r">Balance</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {res.rows.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`}>{o.orderNumber}</Link></td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td>{o.customerName}<br /><span className="muted">{o.customerMobile}</span></td>
                  <td>{o.snapshot.name}</td>
                  <td className="r">{inr(o.priceAmount)}</td>
                  <td className="r">{inr(o.paid)}</td>
                  <td className="r">{inr(o.balance)}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="row-actions" style={{ marginTop: 12 }}>
        {res.page > 1 && <Link className="btn btn-outline btn-sm" href={qs(res.page - 1)}>Previous</Link>}
        <span className="muted">Page {res.page} of {res.pages}</span>
        {res.page < res.pages && <Link className="btn btn-outline btn-sm" href={qs(res.page + 1)}>Next</Link>}
      </div>
    </>
  );
}
