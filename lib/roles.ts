export const ROLE_KEYS = ['admin', 'manager', 'editor', 'designer'] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export type Permission =
  | 'dashboard' | 'orders' | 'clients' | 'enquiries' | 'packages' | 'portfolio' | 'media'
  | 'meta' | 'reports' | 'settings' | 'team' | 'tasks' | 'assign' | 'notes';

const ALL: Permission[] = ['dashboard', 'orders', 'clients', 'enquiries', 'packages', 'portfolio', 'media', 'meta', 'reports', 'settings', 'team', 'tasks', 'assign', 'notes'];

// What each role may do. Admin can do everything. Edit here to change access.
const MATRIX: Record<RoleKey, Permission[]> = {
  admin: ALL,
  manager: ['dashboard', 'orders', 'clients', 'enquiries', 'packages', 'meta', 'reports', 'assign', 'notes'],
  editor: ['dashboard', 'portfolio', 'media'],
  designer: ['dashboard', 'tasks', 'notes'],
};

export const ROLE_LABEL: Record<RoleKey, string> = { admin: 'Admin', manager: 'Manager', editor: 'Editor', designer: 'Designer' };

export function can(role: RoleKey, permission: Permission): boolean {
  return MATRIX[role].includes(permission);
}

export const NAV_ITEMS: Array<{ href: string; label: string; permission: Permission }> = [
  { href: '/admin', label: 'Dashboard', permission: 'dashboard' },
  { href: '/admin/tasks', label: 'My tasks', permission: 'tasks' },
  { href: '/admin/orders', label: 'Orders', permission: 'orders' },
  { href: '/admin/clients', label: 'Clients', permission: 'clients' },
  { href: '/admin/enquiries', label: 'Enquiries', permission: 'enquiries' },
  { href: '/admin/packages', label: 'Packages', permission: 'packages' },
  { href: '/admin/portfolio', label: 'Portfolio', permission: 'portfolio' },
  { href: '/admin/media', label: 'Media library', permission: 'media' },
  { href: '/admin/meta-ads', label: 'Meta Ads Log', permission: 'meta' },
  { href: '/admin/reports', label: 'Reports', permission: 'reports' },
  { href: '/admin/team', label: 'Team', permission: 'team' },
  { href: '/admin/settings', label: 'Settings', permission: 'settings' },
];

/** Sidebar links this role is allowed to see. */
export function navFor(role: RoleKey): Array<[string, string]> {
  return NAV_ITEMS.filter((item) => can(role, item.permission)).map((item) => [item.href, item.label]);
}
