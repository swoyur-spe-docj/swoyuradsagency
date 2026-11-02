import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getOrder, getPayments, getSettings, NEXT_STATUS, orderAssigneeId } from '@/lib/repo';
import { requireUser } from '@/lib/session-user';
import { can } from '@/lib/roles';
import { DesignerOrderView } from '@/components/DesignerOrderView';
import { OrderAssignment } from '@/components/OrderAssignment';
import { inr, fmtDate, today } from '@/lib/format';
import { templates, waLink } from '@/lib/whatsapp';
import { phoneHref } from '@/lib/site-contact';
import { PAY_LABEL, PAY_METHODS, type OrderStatus } from '@/lib/types';
import { StatusBadge, Notice, Empty } from '@/components/ui';
import {
  orderStatusAction, addPaymentAction, activateAction, orderNotesAction, agreementAction,
} from '@/app/actions';

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  contacted: 'Mark as contacted',
  confirmed: 'Mark as confirmed',
  completed: 'Mark as completed',
  cancelled: 'Cancel order',
};

export default async function OrderDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { notice?: string; error?: string };
}) {
  const user = await requireUser();
  if (user.role === 'designer') {
    if ((await orderAssigneeId(params.id)) !== user.id) redirect('/admin/tasks?error=' + encodeURIComponent('That order is not assigned to you.'));
    return <DesignerOrderView orderId={params.id} />;
  }
  if (!can(user.role, 'orders')) redirect('/admin?error=' + encodeURIComponent('You do not have access to that section.'));
  const o = await getOrder(params.id);
  if (!o) notFound();
  const [payments, s] = await Promise.all([getPayments(o.id), getSettings()]);
  const allowed = NEXT_STATUS[o.status];
  const msgs = templates(o, s);
  const custWa = waLink(`91${o.customerMobile}`, `Hi ${o.customerName}, regarding your order ${o.orderNumber}.`);

  return (
    <>
      <p className="muted" style={{ margin: 0 }}><Link href="/admin/orders">← Orders</Link></p>
      <h1 style={{ marginTop: 6 }}>
        Order {o.orderNumber} <StatusBadge status={o.status} />
      </h1>
      <Notice notice={searchParams.notice} error={searchParams.error} />
      <OrderAssignment orderId={params.id} />

      <div className="detail-grid">
        <div>
          <section className="card">
            <h2>Customer</h2>
            <dl className="kv">
              <dt>Name</dt><dd>{o.customerName}</dd>
              <dt>Mobile</dt><dd><a href={phoneHref(o.customerMobile)}>{o.customerMobile}</a></dd>
              <dt>Email</dt><dd>{o.customerEmail || '-'}</dd>
              <dt>Business</dt><dd>{o.business}</dd>
              <dt>City</dt><dd>{o.city}</dd>
              <dt>Goal</dt><dd>{o.goal || '-'}</dd>
              <dt>Preferred start</dt><dd>{o.startDate ? fmtDate(o.startDate) : '-'}</dd>
              <dt>GST</dt><dd>{o.gst || '-'}</dd>
            </dl>
            <div className="row-actions" style={{ marginTop: 12 }}>
              <a className="btn btn-outline btn-sm" href={phoneHref(o.customerMobile)}>Call</a>
              <a className="btn btn-outline btn-sm" href={custWa} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </section>

          <section className="card">
            <h2>Package (price locked at order time)</h2>
            <p style={{ margin: '0 0 6px' }}><strong>{o.snapshot.name}</strong> · {o.snapshot.durationMonths} months · {inr(o.priceAmount)}</p>
            <p className="muted" style={{ margin: 0 }}>{o.snapshot.videos} videos · {o.snapshot.posters} posters</p>
          </section>

          <section className="card">
            <h2>WhatsApp messages</h2>
            {msgs.map((m) => {
              const link = waLink(`91${o.customerMobile}`, m.text);
              return (
                <details key={m.label} style={{ marginBottom: 10 }}>
                  <summary>{m.label}</summary>
                  <textarea readOnly rows={4} defaultValue={m.text} />
                  <div style={{ marginTop: 8 }}>
                    <a className="btn btn-outline btn-sm" href={link} target="_blank" rel="noreferrer">Open in WhatsApp</a>
                  </div>
                </details>
              );
            })}
          </section>

          <section className="card">
            <h2>Notes</h2>
            <form action={orderNotesAction} className="form">
              <input type="hidden" name="orderId" value={o.id} />
              <textarea name="notes" rows={3} defaultValue={o.notes} />
              <div><button className="btn btn-outline btn-sm" type="submit">Save notes</button></div>
            </form>
          </section>

          <section className="card">
            <h2>Activity</h2>
            {o.events.length === 0 ? <Empty text="No activity yet." /> : (
              <ul className="timeline">
                {[...o.events].reverse().map((e, i) => (
                  <li key={i}><span className="muted">{fmtDate(e.at)}</span> · {e.text}</li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div>
          <section className="card">
            <h2>Next step</h2>
            {o.status === 'confirmed' && (
              <p className="muted" style={{ marginTop: 0 }}>Share payment details with the customer. Record payments below.</p>
            )}
            {o.status === 'paid' && <p className="muted" style={{ marginTop: 0 }}>Payment complete. Activate the campaign.</p>}
            <div className="row-actions">
              {allowed.map((st) => (
                st === 'cancelled' ? null : (
                  <form action={orderStatusAction} key={st}>
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="status" value={st} />
                    <button className="btn btn-primary btn-sm" type="submit">{ACTION_LABEL[st] || st}</button>
                  </form>
                )
              ))}
            </div>
            {allowed.includes('cancelled') && (
              <form action={orderStatusAction} className="form" style={{ marginTop: 14 }}>
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="status" value="cancelled" />
                <label>Cancel reason (required)<input name="reason" required /></label>
                <div><button className="btn btn-danger btn-sm" type="submit">Cancel order</button></div>
              </form>
            )}
            {o.status === 'cancelled' && <p className="muted">Reason: {o.cancelReason}</p>}
          </section>

          {o.status === 'paid' && (
            <section className="card">
              <h2>Activate campaign</h2>
              <form action={activateAction} className="form">
                <input type="hidden" name="orderId" value={o.id} />
                <label>Campaign start date<input name="startDate" type="date" defaultValue={today()} required /></label>
                <div><button className="btn btn-primary btn-sm" type="submit">Activate</button></div>
              </form>
            </section>
          )}

          <section className="card">
            <h2>Payments</h2>
            <dl className="kv" style={{ marginBottom: 12 }}>
              <dt>Price</dt><dd>{inr(o.priceAmount)}</dd>
              <dt>Paid</dt><dd>{inr(o.paid)}</dd>
              <dt>Balance</dt><dd><strong>{inr(o.balance)}</strong></dd>
            </dl>
            {payments.length === 0 ? <Empty text="No payments recorded." /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Method</th><th>Reference</th><th className="r">Amount</th></tr></thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{fmtDate(p.receivedOn)}</td>
                        <td>{PAY_LABEL[p.method]}</td>
                        <td>{p.reference || '-'}</td>
                        <td className="r">{inr(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {o.status === 'confirmed' && (
              <form action={addPaymentAction} className="form" style={{ marginTop: 14 }}>
                <input type="hidden" name="orderId" value={o.id} />
                <label>Amount (₹, max {inr(o.balance)})<input name="amount" type="number" min={1} max={o.balance} required /></label>
                <label>Method
                  <select name="method" defaultValue="upi">
                    {PAY_METHODS.map((m) => <option key={m} value={m}>{PAY_LABEL[m]}</option>)}
                  </select>
                </label>
                <label>Reference / transaction ID<input name="reference" /></label>
                <label>Date received<input name="receivedOn" type="date" defaultValue={today()} /></label>
                <label>Note<input name="note" /></label>
                <div><button className="btn btn-primary btn-sm" type="submit">Record payment</button></div>
              </form>
            )}
          </section>

          <section className="card">
            <h2>Agreement</h2>
            <form action={agreementAction} className="form">
              <input type="hidden" name="orderId" value={o.id} />
              <label className="check"><input type="checkbox" name="signed" defaultChecked={o.agreementSigned} /> Agreement signed</label>
              <div><button className="btn btn-outline btn-sm" type="submit">Save</button></div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
