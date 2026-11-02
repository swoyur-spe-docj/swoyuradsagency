import type { OrderStatus } from '@/lib/types';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  confirmed: 'Confirmed (payment pending)',
  paid: 'Paid',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`pill pill-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Notice({ notice, error }: { notice?: string; error?: string }) {
  if (!notice && !error) return null;
  return <div className={`notice ${error ? 'error' : 'ok'}`} role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'}>{error || notice}</div>;
}

export function DbErrorNotice({ retryHref }: { retryHref: string }) {
  return <div className="notice error" role="alert"><span>Something went wrong, try again.</span> <a href={retryHref}>Try again</a></div>;
}

export function Empty({ text }: { text: string }) {
  return <p className="empty">{text}</p>;
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
