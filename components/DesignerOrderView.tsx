import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrder } from '@/lib/repo';
import { fmtDate } from '@/lib/format';
import { StatusBadge, Notice } from '@/components/ui';
import { orderNotesAction } from '@/app/actions';

/** What a designer sees on an order assigned to them: the brief and the notes, nothing about payments. */
export async function DesignerOrderView({ orderId, searchParams }: { orderId: string; searchParams?: { notice?: string; error?: string } }) {
  const order = await getOrder(orderId);
  if (!order) notFound();
  return (
    <>
      <p className="muted" style={{ margin: 0 }}><Link href="/admin/tasks">← My tasks</Link></p>
      <div className="dashboard-welcome"><div><p className="eyebrow">ORDER {order.orderNumber}</p><h1>{order.business || order.customerName}</h1><p className="muted">Your brief for this order.</p></div></div>
      <Notice notice={searchParams?.notice} error={searchParams?.error} />
      <div className="grid-2 designer-brief">
        <section className="card">
          <h2>Brief</h2>
          <dl className="kv">
            <dt>Status</dt><dd><StatusBadge status={order.status} /></dd>
            <dt>Goal</dt><dd>{order.goal || '—'}</dd>
            <dt>Start date</dt><dd>{order.startDate ? fmtDate(order.startDate) : '—'}</dd>
            <dt>City</dt><dd>{order.city || '—'}</dd>
          </dl>
        </section>
        <section className="card">
          <h2>Notes for the team</h2>
          <form action={orderNotesAction} className="form">
            <input type="hidden" name="orderId" value={order.id} />
            <label>Notes<textarea name="notes" rows={6} defaultValue={order.notes} /></label>
            <div><button className="btn btn-primary" type="submit">Save notes</button></div>
          </form>
        </section>
      </div>
    </>
  );
}
