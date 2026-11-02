import { listStaff } from '@/lib/repo';
import { requirePermission } from '@/lib/session-user';
import { createStaffAction, resetStaffPasswordAction, updateStaffAction } from '@/app/actions';
import { Notice } from '@/components/ui';
import { ROLE_KEYS, ROLE_LABEL } from '@/lib/roles';

export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function TeamPage({ searchParams }: { searchParams: { notice?: string; error?: string } }) {
  const user = await requirePermission('team');
  const staff = await listStaff();
  return (
    <>
      <div className="dashboard-welcome"><div><p className="eyebrow">TEAM ACCESS</p><h1>Your team</h1><p className="muted">Add people, choose what they can see, and turn access on or off. A designer sees only the orders assigned to them.</p></div></div>
      <Notice notice={searchParams.notice} error={searchParams.error} />

      <section className="card team-add">
        <h2>Add a team member</h2>
        <form action={createStaffAction} className="form">
          <div className="form-2">
            <label>Full name *<input name="name" required minLength={2} maxLength={80} autoComplete="off" /></label>
            <label>Email *<input name="email" type="email" required maxLength={200} autoComplete="off" /></label>
            <label>Role *<select name="role" defaultValue="designer">{ROLE_KEYS.map((role) => <option key={role} value={role}>{ROLE_LABEL[role]}</option>)}</select></label>
            <label>Password *<input name="password" type="password" required minLength={12} autoComplete="new-password" /></label>
          </div>
          <p className="muted team-hint">At least 12 characters, with letters and numbers. Share it privately, and ask them to change it after the first sign-in.</p>
          <div><button className="btn btn-primary" type="submit">Add member</button></div>
        </form>
      </section>

      <section className="team-list">
        {staff.map((member) => (
          <article className="card team-card" key={member.id}>
            <div className="team-head">
              <div><h2>{member.name}</h2><small className="muted">{member.email}</small></div>
              <span className={`pill ${member.active ? '' : 'pill-muted'}`}>{member.active ? ROLE_LABEL[member.role] : 'Inactive'}</span>
            </div>
            {member.id === user.id ? <p className="muted">This is your account.</p> : (
              <>
                <form action={updateStaffAction} className="form team-form">
                  <input type="hidden" name="id" value={member.id} />
                  <label>Role<select name="role" defaultValue={member.role}>{ROLE_KEYS.map((role) => <option key={role} value={role}>{ROLE_LABEL[role]}</option>)}</select></label>
                  <label className="check"><input type="checkbox" name="active" value="yes" defaultChecked={member.active} /> Active (can sign in)</label>
                  <button className="btn btn-outline btn-sm" type="submit">Save</button>
                </form>
                <details className="team-reset">
                  <summary>Reset password</summary>
                  <form action={resetStaffPasswordAction} className="form">
                    <input type="hidden" name="id" value={member.id} />
                    <label>New password<input name="password" type="password" required minLength={12} autoComplete="new-password" /></label>
                    <button className="btn btn-outline btn-sm" type="submit">Set new password</button>
                  </form>
                </details>
              </>
            )}
          </article>
        ))}
      </section>
    </>
  );
}
