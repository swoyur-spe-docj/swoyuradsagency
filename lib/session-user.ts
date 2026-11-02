import 'server-only';
import { redirect } from 'next/navigation';
import { sessionFromCookies, OWNER_ID } from './auth';
import { getStaffById } from './repo';
import { can, type Permission, type RoleKey } from './roles';

export type CurrentUser = { id: string; role: RoleKey; name: string; email: string; owner: boolean };

export async function currentUser(): Promise<CurrentUser | null> {
  const session = await sessionFromCookies();
  if (!session) return null;
  if (session.id === OWNER_ID) return { id: OWNER_ID, role: 'admin', name: 'Studio owner', email: '', owner: true };
  const staff = await getStaffById(session.id);
  if (!staff || !staff.active) return null;
  return { id: staff.id, role: staff.role, name: staff.name, email: staff.email, owner: false };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  return user;
}

export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) redirect('/admin?error=' + encodeURIComponent('You do not have access to that section.'));
  return user;
}
