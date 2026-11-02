import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderByNumber, getSettings } from '@/lib/repo';
import { inr } from '@/lib/format';
import { waLink } from '@/lib/whatsapp';
import { ContactIcon } from '@/components/ContactIcon';
import { STATUS_LABEL } from '@/components/ui';

export default async function OrderPage({ params }: { params: { orderNumber: string } }) {
  const o = await getOrderByNumber(params.orderNumber);
  if (!o) notFound();
  const s = await getSettings();
  const showPayment = ['confirmed', 'paid', 'active', 'completed'].includes(o.status);
  const payLines = [
    s.upiId && `UPI: ${s.upiId}`,
    s.bankName && `Bank: ${s.bankName}`,
    s.accountHolder && `Account name: ${s.accountHolder}`,
    s.accountNumber && `Account number: ${s.accountNumber}`,
    s.ifsc && `IFSC: ${s.ifsc}`,
  ].filter(Boolean) as string[];

  return (
    <section className="container section narrow order-page">
      <h1>Order {o.orderNumber}</h1>
      <p className="muted">Status: <strong>{STATUS_LABEL[o.status]}</strong></p>

      <div className="card">
        <dl className="kv">
          <dt>Package</dt><dd>{o.snapshot.name} · {o.snapshot.durationMonths} months</dd>
          <dt>Price</dt><dd>{inr(o.priceAmount)}</dd>
          <dt>Name</dt><dd>{o.customerName}</dd>
          <dt>Business</dt><dd>{o.business}</dd>
        </dl>
        {o.status === 'new' && <p className="muted">Received. We will contact you shortly to confirm.</p>}
        {o.status === 'cancelled' && <p className="muted">This order was cancelled. You can place a new order anytime.</p>}
      </div>

      {showPayment && (
        <div className="card">
          <h3>Payment details</h3>
          {payLines.length ? (
            <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{payLines.join('\n')}</p>
          ) : (
            <p className="muted" style={{ margin: 0 }}>We will share payment details on WhatsApp.</p>
          )}
        </div>
      )}

      <a
        className="btn btn-primary"
        target="_blank"
        rel="noreferrer"
        href={waLink(s.whatsapp, `Hi, I am following up on my order ${o.orderNumber}.`)}
      >
        <ContactIcon name="whatsapp" /> Message us on WhatsApp
      </a>
      <p style={{ marginTop: 16 }}><Link href="/packages">Back to packages</Link></p>
    </section>
  );
}
