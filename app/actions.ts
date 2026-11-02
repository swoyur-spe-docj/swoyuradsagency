'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import * as repo from '@/lib/repo';
import { ADMIN_COOKIE, OWNER_ID, checkPassword, sessionToken, type SessionUser } from '@/lib/auth';
import { currentUser } from '@/lib/session-user';
import { can, type Permission, type RoleKey } from '@/lib/roles';
import { passwordProblem, verifyPassword } from '@/lib/passwords';
import { isThemeKey } from '@/lib/themes';
import type { Category, OrderStatus, PayMethod, ThemeKey } from '@/lib/types';
import { consumeRateLimit, sourceAddress } from '@/lib/ratelimit';
import { createUploadTicket, deleteStoredFile } from '@/lib/storage';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const num = (f: FormData, k: string) => Number(f.get(k) ?? 0) || 0;
const flag = (f: FormData, k: string) => f.get(k) === 'on';

function back(path: string, ok: boolean, msg: string): never {
  const sep = path.includes('?') ? '&' : '?';
  redirect(`${path}${sep}${ok ? 'notice' : 'error'}=${encodeURIComponent(msg)}`);
}

/** Requires a signed-in user. With a permission, also checks the role. Returns the user. */
async function guard(permission?: Permission) {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  if (permission && !can(user.role, permission)) redirect('/admin?error=' + encodeURIComponent('You do not have access to that action.'));
  return user;
}

async function rateAllowed(scope: 'login' | 'checkout' | 'enquiry', limit: number, windowSeconds: number) {
  return (await consumeRateLimit(scope, sourceAddress(await headers()), limit, windowSeconds)).allowed;
}

function refresh() {
  revalidatePath('/', 'layout');
}

// ---------- Public ----------
export async function createOrderAction(formData: FormData) {
  if (str(formData, 'website')) redirect('/packages'); // honeypot
  const slug = str(formData, 'packageSlug');
  let withinLimit = false;
  try { withinLimit = await rateAllowed('checkout', 5, 3600); } catch {
    redirect(`/checkout?package=${encodeURIComponent(slug)}&error=${encodeURIComponent('Order submission is temporarily unavailable. Please try again shortly.')}`);
  }
  if (!withinLimit) {
    redirect(`/checkout?package=${encodeURIComponent(slug)}&error=${encodeURIComponent('Too many order attempts. Please try again later.')}`);
  }
  const res = await repo.createOrder({
    packageSlug: slug,
    name: str(formData, 'name'),
    mobile: str(formData, 'mobile'),
    email: str(formData, 'email'),
    business: str(formData, 'business'),
    city: str(formData, 'city'),
    goal: str(formData, 'goal'),
    startDate: str(formData, 'startDate'),
    gst: str(formData, 'gst').toUpperCase(),
    agree: flag(formData, 'agree'),
  });
  if ('error' in res) {
    redirect(`/checkout?package=${encodeURIComponent(slug)}&error=${encodeURIComponent(res.error)}`);
  }
  refresh();
  redirect(`/order/${res.receiptToken}`);
}

export async function addEnquiryAction(formData: FormData) {
  const returnTo = str(formData, 'returnTo') === '/' ? '/' : '/contact';
  if (str(formData, 'website')) redirect(`${returnTo}?sent=1#enquiry`);
  let withinLimit = false;
  try { withinLimit = await rateAllowed('enquiry', 5, 900); } catch {
    redirect(`${returnTo}?error=${encodeURIComponent('Enquiry submission is temporarily unavailable. Please try again shortly.') }#enquiry`);
  }
  if (!withinLimit) {
    redirect(`${returnTo}?error=${encodeURIComponent('Too many enquiries were sent from this connection. Please try again later.') }#enquiry`);
  }
  const res = await repo.addEnquiry({
    name: str(formData, 'name'),
    mobile: str(formData, 'mobile'),
    message: str(formData, 'message'),
    email: str(formData, 'email'),
    business: str(formData, 'business'),
    budget: str(formData, 'budget'),
    services: formData.getAll('services').map(String).slice(0, 8),
  });
  if ('error' in res) redirect(`${returnTo}?error=${encodeURIComponent(res.error)}#enquiry`);
  refresh();
  redirect(`${returnTo}?sent=1#enquiry`);
}

export async function loginAction(formData: FormData) {
  let withinLimit = false;
  try { withinLimit = await rateAllowed('login', 5, 300); } catch {
    redirect(`/admin/login?error=${encodeURIComponent('Login is temporarily unavailable. Please try again shortly.')}`);
  }
  if (!withinLimit) redirect(`/admin/login?error=${encodeURIComponent('Too many login attempts. Please wait five minutes and try again.')}`);
  const email = str(formData, 'email').trim().toLowerCase();
  const password = str(formData, 'password');
  let session: SessionUser | null = null;
  if (checkPassword(password)) {
    session = { id: OWNER_ID, role: 'admin' };
  } else if (email) {
    const staff = await repo.findStaffByEmail(email);
    if (staff && staff.active && (await verifyPassword(password, staff.passwordHash))) session = { id: staff.id, role: staff.role };
  }
  if (!session) redirect(`/admin/login?error=${encodeURIComponent('Wrong email or password')}`);
  (await cookies()).set(ADMIN_COOKIE, sessionToken(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  redirect('/admin');
}

export async function logoutAction() {
  await guard();
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

// ---------- Orders ----------
export async function orderStatusAction(fd: FormData) {
  await guard('orders');
  const id = str(fd, 'id');
  const path = `/admin/orders/${id}`;
  const res = await repo.setStatus(id, str(fd, 'status') as OrderStatus, str(fd, 'reason'));
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Status updated');
}

export async function addPaymentAction(fd: FormData) {
  await guard('orders');
  const id = str(fd, 'orderId');
  const path = `/admin/orders/${id}`;
  const res = await repo.addPayment(id, {
    amount: num(fd, 'amount'),
    method: (str(fd, 'method') || 'upi') as PayMethod,
    reference: str(fd, 'reference'),
    receivedOn: str(fd, 'receivedOn'),
    note: str(fd, 'note'),
  });
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Payment recorded');
}

export async function activateAction(fd: FormData) {
  await guard('orders');
  const id = str(fd, 'orderId');
  const path = `/admin/orders/${id}`;
  const res = await repo.activateOrder(id, str(fd, 'startDate'));
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Campaign activated and client created');
}

export async function orderNotesAction(fd: FormData) {
  const user = await guard('notes');
  const id = str(fd, 'orderId');
  if (user.role === 'designer' && (await repo.orderAssigneeId(id)) !== user.id) back('/admin/tasks', false, 'That order is not assigned to you.');
  const path = `/admin/orders/${id}`;
  const res = await repo.updateOrder(id, { notes: str(fd, 'notes') });
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Notes saved');
}

export async function agreementAction(fd: FormData) {
  await guard('orders');
  const id = str(fd, 'orderId');
  const path = `/admin/orders/${id}`;
  const res = await repo.updateOrder(id, { agreementSigned: flag(fd, 'signed') });
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Agreement status saved');
}

// ---------- Clients ----------
export async function quotaAction(fd: FormData) {
  await guard('orders');
  const path = '/admin/clients';
  const kind = str(fd, 'kind') === 'poster' ? 'poster' : 'video';
  const res = await repo.bumpQuota(str(fd, 'cpId'), kind);
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, `${kind === 'video' ? 'Video' : 'Poster'} delivered`);
}

// ---------- Packages ----------
export async function savePackageAction(fd: FormData) {
  await guard('packages');
  const path = '/admin/packages';
  const slug = str(fd, 'slug').toLowerCase().replace(/\s+/g, '-');
  const res = await repo.savePackage({
    id: str(fd, 'id') || undefined,
    slug: str(fd, 'slug').toLowerCase().replace(/\s+/g, '-'),
    name: str(fd, 'name'),
    durationMonths: num(fd, 'durationMonths'),
    price: num(fd, 'price'),
    videos: num(fd, 'videos'),
    posters: num(fd, 'posters'),
    deliverables: str(fd, 'deliverables').split('\n').map((s) => s.trim()).filter(Boolean),
    featured: flag(fd, 'featured'),
    active: flag(fd, 'active'),
    sortOrder: num(fd, 'sortOrder'),
  });
  if ('error' in res) { refresh(); back(path, false, res.error); }
  const media = await repo.setPackageMedia(slug, { coverUrl: str(fd, 'coverUrl'), coverVideoUrl: str(fd, 'coverVideoUrl') });
  refresh();
  if ('error' in media) back(path, false, media.error);
  back(path, true, 'Package saved');
}

export async function deletePackageAction(fd: FormData) {
  await guard('packages');
  const path = '/admin/packages';
  const res = await repo.deletePackage(str(fd, 'id'));
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Package deleted');
}

// ---------- Portfolio ----------
export async function savePortfolioAction(fd: FormData) {
  await guard('portfolio');
  const path = '/admin/portfolio';
  const res = await repo.savePortfolio({
    id: str(fd, 'id') || undefined,
    title: str(fd, 'title'),
    category: (str(fd, 'category') || 'Video') as Category,
    thumbUrl: str(fd, 'thumbUrl'),
    videoUrl: str(fd, 'videoUrl'),
    published: flag(fd, 'published'),
    sortOrder: num(fd, 'sortOrder'),
    slug: str(fd, 'slug'),
    clientName: str(fd, 'clientName'),
    challenge: str(fd, 'challenge'),
    solution: str(fd, 'solution'),
    result: str(fd, 'result'),
  });
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Portfolio item saved');
}

export async function deletePortfolioAction(fd: FormData) {
  await guard('portfolio');
  const res = await repo.deletePortfolio(str(fd, 'id'));
  refresh();
  if ('error' in res) back('/admin/portfolio', false, res.error);
  back('/admin/portfolio', true, 'Item deleted');
}

export async function movePortfolioAction(fd: FormData) {
  await guard('portfolio');
  const res = await repo.movePortfolio(str(fd, 'id'), str(fd, 'dir') === 'up' ? 'up' : 'down');
  refresh();
  if ('error' in res) back('/admin/portfolio', false, res.error);
  back('/admin/portfolio', true, 'Order updated');
}

// ---------- Enquiries ----------
export async function enquiryDoneAction(fd: FormData) {
  await guard('enquiries');
  const res = await repo.markEnquiryDone(str(fd, 'id'));
  refresh();
  if ('error' in res) back('/admin/enquiries', false, res.error);
  back('/admin/enquiries', true, 'Marked as done');
}

// ---------- Meta Ads log ----------
export async function addMetaAction(fd: FormData) {
  await guard('meta');
  const path = '/admin/meta-ads';
  const res = await repo.addMeta({
    clientId: str(fd, 'clientId'),
    campaign: str(fd, 'campaign'),
    startDate: str(fd, 'startDate'),
    endDate: str(fd, 'endDate'),
    budget: num(fd, 'budget'),
    spend: num(fd, 'spend'),
    leads: num(fd, 'leads'),
    notes: str(fd, 'notes'),
  });
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Entry added');
}

// ---------- Settings ----------
export async function settingsAction(fd: FormData) {
  await guard('settings');
  const path = '/admin/settings';
  const theme = str(fd, 'theme');
  if (!isThemeKey(theme)) back(path, false, 'Choose a valid theme');
  const res = await repo.updateSettings({
    companyName: str(fd, 'companyName'),
    address: str(fd, 'address'),
    phone: str(fd, 'phone'),
    whatsapp: str(fd, 'whatsapp').replace(/\D/g, ''),
    email: str(fd, 'email'),
    instagram: str(fd, 'instagram'),
    facebook: str(fd, 'facebook'),
    linkedin: str(fd, 'linkedin'),
    youtube: str(fd, 'youtube'),
    upiId: str(fd, 'upiId'),
    bankName: str(fd, 'bankName'),
    accountHolder: str(fd, 'accountHolder'),
    accountNumber: str(fd, 'accountNumber'),
    ifsc: str(fd, 'ifsc'),
    theme: theme as ThemeKey,
  });
  refresh();
  if ('error' in res) back(path, false, res.error);
  (await cookies()).set('padmaarc_theme', theme, {
    httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365,
  });
  back(path, true, 'Settings saved');
}

export async function saveMediaAction(fd: FormData) {
  await guard('media');
  const path = '/admin/media';
  const res = await repo.saveMedia({ id: str(fd, 'id'), url: str(fd, 'url'), alt: str(fd, 'alt') });
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Media updated on the website');
}


// ---------- Media uploads (admin only) ----------
export async function createUploadTicketAction(input: { name: string; type: string; size: number; kind: 'image' | 'video' }) {
  await guard('media');
  try {
    const ticket = await createUploadTicket({ name: String(input.name), type: String(input.type), size: Number(input.size), kind: input.kind });
    return { ok: true as const, ticket };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : 'The upload could not be prepared.' };
  }
}

export async function setMediaAction(input: { id: string; url: string; alt?: string; posterUrl?: string }) {
  await guard('media');
  const res = await repo.saveMedia(input);
  refresh();
  return res;
}

export async function addCustomMediaAction(input: { label: string; kind: 'image' | 'video'; url: string; alt: string }) {
  await guard('media');
  const res = await repo.addCustomMedia(input);
  refresh();
  return res;
}

export async function deleteCustomMediaAction(id: string) {
  await guard('media');
  const res = await repo.deleteCustomMedia(id);
  if ('error' in res) return res;
  if (res.url) await deleteStoredFile(res.url);
  refresh();
  return { ok: true as const };
}


// ---------- Team and assignments (admin and manager) ----------
const STAFF_ROLES = ['manager', 'editor', 'designer', 'admin'] as const;

export async function createStaffAction(fd: FormData) {
  const actor = await guard('team');
  const path = '/admin/team';
  const name = str(fd, 'name').trim();
  const email = str(fd, 'email').trim().toLowerCase();
  const role = str(fd, 'role') as RoleKey;
  const password = str(fd, 'password');
  if (name.length < 2) back(path, false, 'Enter the person’s name (at least 2 letters).');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) back(path, false, 'Enter a valid email address.');
  if (!(STAFF_ROLES as readonly string[]).includes(role)) back(path, false, 'Choose a valid role.');
  if (role === 'admin' && actor.role !== 'admin') back(path, false, 'Only an admin can add another admin.');
  const problem = passwordProblem(password);
  if (problem) back(path, false, problem);
  const res = await repo.createStaff({ name, email, role, password });
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Team member added. They can sign in with their email and password.');
}

export async function updateStaffAction(fd: FormData) {
  const actor = await guard('team');
  const path = '/admin/team';
  const id = str(fd, 'id');
  if (id === actor.id) back(path, false, 'You cannot change your own access here.');
  const role = str(fd, 'role') as RoleKey;
  if (!(STAFF_ROLES as readonly string[]).includes(role)) back(path, false, 'Choose a valid role.');
  if (role === 'admin' && actor.role !== 'admin') back(path, false, 'Only an admin can give admin access.');
  const active = str(fd, 'active') === 'yes';
  const res = await repo.updateStaff(id, { role, active });
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Saved');
}

export async function resetStaffPasswordAction(fd: FormData) {
  await guard('team');
  const path = '/admin/team';
  const id = str(fd, 'id');
  const password = str(fd, 'password');
  const problem = passwordProblem(password);
  if (problem) back(path, false, problem);
  const res = await repo.updateStaff(id, { password });
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, 'Password changed. Share the new one privately.');
}

export async function assignOrderAction(fd: FormData) {
  await guard('assign');
  const orderId = str(fd, 'orderId');
  const staffId = str(fd, 'staffId') || null;
  const path = `/admin/orders/${orderId}`;
  const res = await repo.assignOrder(orderId, staffId);
  refresh();
  if ('error' in res) back(path, false, res.error);
  back(path, true, staffId ? 'Order assigned' : 'Assignment removed');
}
