import { listStaff, orderAssigneeId, getOrder } from '@/lib/repo';
import { requireUser } from '@/lib/session-user';
import { can } from '@/lib/roles';
import { assignOrderAction } from '@/app/actions';
import { ROLE_LABEL } from '@/lib/roles';

/** Admins and managers choose who works on the order. Hidden from everyone else. */
export async function OrderAssignment({ orderId }: { orderId: string }) {
  const user = await requireUser();
  if (!can(user.role, 'assign')) return null;
  const [staff, assignee, order] = await Promise.all([listStaff(), orderAssigneeId(orderId), getOrder(orderId)]);
  if (!order) return null;
  const options = staff.filter((member) => member.active);
  return (
    <section className="card order-assignment">
      <div>
        <p className="eyebrow">ASSIGNMENT</p>
        <h2>Who is working on this?</h2>
        <p className="muted">{assignee ? `Currently assigned to ${options.find((m) => m.id === assignee)?.name ?? 'a team member'}.` : 'Not assigned yet.'}</p>
      </div>
      <form action={assignOrderAction} className="form assign-form">
        <input type="hidden" name="orderId" value={orderId} />
        <label>Team member
          <select name="staffId" defaultValue={assignee ?? ''}>
            <option value="">Unassigned</option>
            {options.map((member) => (
              <option key={member.id} value={member.id}>{member.name} · {ROLE_LABEL[member.role]}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" type="submit">Save assignment</button>
      </form>
    </section>
  );
}
