import Link from 'next/link';
import { listAssignedOrders } from '@/lib/repo';
import { requirePermission } from '@/lib/session-user';
import { StatusBadge, Notice, Empty } from '@/components/ui';

export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function TasksPage({ searchParams }: { searchParams: { notice?: string; error?: string } }) {
  const user = await requirePermission('tasks');
  const orders = await listAssignedOrders(user.id);
  return (
    <>
      <div className="dashboard-welcome"><div><p className="eyebrow">MY TASKS</p><h1>Work assigned to you</h1><p className="muted">Open an order to read the brief and add notes for the team.</p></div></div>
      <Notice notice={searchParams.notice} error={searchParams.error} />
      {orders.length === 0 ? <Empty text="No orders are assigned to you yet." /> : (
        <ul className="task-list task-list-full">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/admin/orders/${order.id}`}>
                <strong>{order.business || order.customerName}</strong>
                <small>{order.orderNumber} · {order.goal || 'No goal noted'}</small>
              </Link>
              <StatusBadge status={order.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
