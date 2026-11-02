import 'server-only';
import { randomUUID } from 'crypto';

import type {
  Client, ClientPackage, ClientRow, Enquiry, MetaEntry, Order, OrderStatus, OrderView,
  Payment, PayMethod, PortfolioItem, Pkg, Res, Settings, Category, Snapshot,
} from './types';
import { daysUntil, today } from './format';
import { MEDIA_DEFAULTS, type MediaAsset } from './media';
import { ROLE_KEYS, type RoleKey } from './roles';
import { hashPassword } from './passwords';
import { serverEnvironment } from './env';
import { DEFAULT_SITE_CONTACT } from './site-contact';
import { DEFAULT_THEME, isThemeKey } from './themes';

export const PAGE_SIZE = 20;

export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  new: ['contacted', 'cancelled'],
  contacted: ['confirmed', 'cancelled'],
  confirmed: ['cancelled'],
  paid: [],
  active: ['completed'],
  completed: [],
  cancelled: [],
};

const MOBILE = /^[0-9]{10}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GST = /^[0-9A-Z]{15}$/;
const ORDER_STATUSES: OrderStatus[] = ['new', 'contacted', 'confirmed', 'paid', 'active', 'completed', 'cancelled'];

type Row = Record<string, unknown>;

class DatabaseError extends Error {
  status: number;
  serverMessage: string;
  constructor(status: number, serverMessage: string) {
    super('Supabase database request failed (HTTP ' + status + ')');
    this.name = 'DatabaseError';
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

function queryString(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value !== undefined) params.set(key, String(value));
  return params.toString();
}

async function request<T>(resource: string, init: RequestInit = {}): Promise<{ data: T; headers: Headers }> {
  const { supabaseUrl, supabaseServiceRoleKey } = serverEnvironment();
  const headers = new Headers(init.headers);
  headers.set('apikey', supabaseServiceRoleKey);
  headers.set('Authorization', 'Bearer ' + supabaseServiceRoleKey);
  headers.set('Accept', 'application/json');
  if (init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(supabaseUrl + '/rest/v1/' + resource, {
    ...init,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  if (!response.ok) {
    let message = text.slice(0, 1000);
    try {
      const parsed = JSON.parse(text) as Row;
      message = String(parsed.message || parsed.hint || parsed.details || message);
    } catch { /* Keep the bounded response text. */ }
    throw new DatabaseError(response.status, message);
  }
  let data: unknown = null;
  if (text) {
    try { data = JSON.parse(text); }
    catch { throw new Error('Supabase returned an invalid response.'); }
  }
  return { data: data as T, headers: response.headers };
}

async function selectRows(table: string, params: Record<string, string | number | undefined> = {}, range?: [number, number]) {
  const headers: Record<string, string> = {};
  if (range) {
    headers.Range = range[0] + '-' + range[1];
    headers['Range-Unit'] = 'items';
    headers.Prefer = 'count=exact';
  }
  return request<Row[]>(table + '?' + queryString({ select: '*', ...params }), { headers });
}

async function allRows(table: string, params: Record<string, string | number | undefined> = {}): Promise<Row[]> {
  const result: Row[] = [];
  const chunk = 1000;
  for (let offset = 0; ; offset += chunk) {
    const page = await selectRows(table, params, [offset, offset + chunk - 1]);
    const rows = page.data || [];
    result.push(...rows);
    if (rows.length < chunk) return result;
  }
}

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const result = await request<T>('rpc/' + name, { method: 'POST', body: JSON.stringify(body) });
  return result.data;
}

function asText(value: unknown): string {
  return value == null ? '' : String(value);
}

function asNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function asDate(value: unknown): string {
  return asText(value).slice(0, 10);
}

function parseArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function mapPackage(row: Row): Pkg {
  return {
    id: asText(row.id),
    slug: asText(row.slug),
    name: asText(row.name),
    durationMonths: asNumber(row.duration_months),
    price: asNumber(row.price),
    videos: asNumber(row.videos),
    posters: asNumber(row.posters),
    deliverables: parseArray(row.deliverables),
    coverUrl: asText(row.cover_url),
    coverVideoUrl: asText(row.cover_video_url),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    sortOrder: asNumber(row.sort_order),
  };
}

function mapSnapshot(value: unknown): Snapshot {
  const row = (value && typeof value === 'object' ? value : {}) as Row;
  return {
    name: asText(row.name),
    price: asNumber(row.price),
    videos: asNumber(row.videos),
    posters: asNumber(row.posters),
    durationMonths: asNumber(row.durationMonths ?? row.duration_months),
    deliverables: parseArray(row.deliverables),
    coverUrl: asText(row.coverUrl ?? row.cover_url),
    coverVideoUrl: asText(row.coverVideoUrl ?? row.cover_video_url),
  };
}

function mapOrder(row: Row): Order {
  const status = ORDER_STATUSES.includes(asText(row.status) as OrderStatus) ? asText(row.status) as OrderStatus : 'new';
  const rawEvents = Array.isArray(row.events) ? row.events as Row[] : [];
  return {
    id: asText(row.id),
    orderNumber: asText(row.order_number),
    packageId: asText(row.package_id),
    snapshot: mapSnapshot(row.snapshot),
    priceAmount: asNumber(row.price_amount),
    customerName: asText(row.customer_name),
    customerMobile: asText(row.customer_mobile),
    customerEmail: asText(row.customer_email),
    business: asText(row.business),
    city: asText(row.city),
    goal: asText(row.goal),
    startDate: asDate(row.start_date),
    gst: asText(row.gst),
    status,
    cancelReason: asText(row.cancel_reason),
    notes: asText(row.notes),
    agreementSigned: Boolean(row.agreement_signed),
    clientId: asText(row.client_id),
    assignedTo: asText(row.assigned_to) || null,
    createdAt: asText(row.created_at),
    events: rawEvents.map((event) => ({ at: asText(event.at), text: asText(event.text) })),
  };
}

function mapPayment(row: Row): Payment {
  return {
    id: asText(row.id),
    orderId: asText(row.order_id),
    amount: asNumber(row.amount),
    method: asText(row.method) as PayMethod,
    reference: asText(row.reference),
    receivedOn: asDate(row.received_on),
    note: asText(row.note),
  };
}

function mapClient(row: Row): Client {
  return {
    id: asText(row.id),
    name: asText(row.name),
    business: asText(row.business),
    city: asText(row.city),
    mobile: asText(row.mobile),
    email: asText(row.email),
  };
}

function mapClientPackage(row: Row): ClientPackage {
  return {
    id: asText(row.id),
    clientId: asText(row.client_id),
    orderId: asText(row.order_id),
    packageName: asText(row.package_name),
    startDate: asDate(row.start_date),
    endDate: asDate(row.end_date),
    videosTotal: asNumber(row.videos_total),
    videosUsed: asNumber(row.videos_used),
    postersTotal: asNumber(row.posters_total),
    postersUsed: asNumber(row.posters_used),
  };
}

function mapEnquiry(row: Row): Enquiry {
  return {
    id: asText(row.id),
    name: asText(row.name),
    mobile: asText(row.mobile),
    message: asText(row.message),
    email: asText(row.email),
    business: asText(row.business),
    budget: asText(row.budget),
    services: parseArray(row.services),
    status: row.status === 'done' ? 'done' : 'new',
    createdAt: asText(row.created_at),
  };
}

function mapMeta(row: Row, clientName = '-'): MetaEntry & { clientName: string } {
  return {
    id: asText(row.id),
    clientId: asText(row.client_id),
    campaign: asText(row.campaign),
    startDate: asDate(row.start_date),
    endDate: asDate(row.end_date),
    budget: asNumber(row.budget),
    spend: asNumber(row.spend),
    leads: asNumber(row.leads),
    notes: asText(row.notes),
    clientName,
  };
}

function mapPortfolio(row: Row): PortfolioItem {
  return {
    id: asText(row.id),
    title: asText(row.title),
    category: asText(row.category) as Category,
    thumbUrl: asText(row.thumb_url),
    videoUrl: asText(row.video_url),
    published: Boolean(row.published),
    sortOrder: asNumber(row.sort_order),
    slug: asText(row.slug),
    clientName: asText(row.client_name),
    challenge: asText(row.challenge),
    solution: asText(row.solution),
    result: asText(row.result),
  };
}

const DEFAULT_SETTINGS: Settings = {
  companyName: 'The Padmaarc Advertising',
  address: 'Sitamarhi, Bihar',
  phone: DEFAULT_SITE_CONTACT.phone,
  whatsapp: DEFAULT_SITE_CONTACT.whatsapp,
  email: DEFAULT_SITE_CONTACT.email,
  instagram: DEFAULT_SITE_CONTACT.instagram,
  facebook: DEFAULT_SITE_CONTACT.facebook,
  linkedin: DEFAULT_SITE_CONTACT.linkedin,
  youtube: DEFAULT_SITE_CONTACT.youtube,
  upiId: '',
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  ifsc: '',
  theme: DEFAULT_THEME,
};

function mapSettings(row: Row): Settings {
  const theme = asText(row.theme);
  return {
    companyName: asText(row.company_name ?? DEFAULT_SETTINGS.companyName),
    address: asText(row.address ?? DEFAULT_SETTINGS.address),
    phone: asText(row.phone ?? DEFAULT_SETTINGS.phone),
    whatsapp: asText(row.whatsapp ?? DEFAULT_SETTINGS.whatsapp),
    email: asText(row.email ?? DEFAULT_SETTINGS.email),
    instagram: asText(row.instagram ?? DEFAULT_SETTINGS.instagram),
    facebook: asText(row.facebook),
    linkedin: asText(row.linkedin),
    youtube: asText(row.youtube),
    upiId: asText(row.upi_id),
    bankName: asText(row.bank_name),
    accountHolder: asText(row.account_holder),
    accountNumber: asText(row.account_number),
    ifsc: asText(row.ifsc),
    theme: isThemeKey(theme) ? theme : DEFAULT_THEME,
  };
}

function mapMedia(row: Row): MediaAsset {
  return {
    id: asText(row.id),
    label: asText(row.label),
    kind: row.kind === 'video' ? 'video' : 'image',
    url: asText(row.url),
    alt: asText(row.alt),
    posterUrl: asText(row.poster_url),
    custom: row.is_custom === true,
  };
}

function paymentTotals(payments: Payment[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const payment of payments) totals.set(payment.orderId, (totals.get(payment.orderId) || 0) + payment.amount);
  return totals;
}

function withTotals(order: Order, totals: Map<string, number>): OrderView {
  const paid = totals.get(order.id) || 0;
  return { ...order, paid, balance: Math.max(0, order.priceAmount - paid) };
}

function rpcResult(value: unknown): Res {
  const row = Array.isArray(value) ? value[0] as Row | undefined : value as Row | undefined;
  if (!row || row.ok !== true) return { error: asText(row?.error) || 'The request could not be completed.' };
  return { ok: true };
}

function genericWriteError(action: string): Res {
  return { error: action + ' could not be saved right now. Please try again shortly.' };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

// ---------- Settings and media ----------
export async function getSettings(): Promise<Settings> {
  const { data } = await selectRows('business_settings', { id: 'eq.1', limit: 1 });
  return data[0] ? mapSettings(data[0]) : { ...DEFAULT_SETTINGS };
}

export async function updateSettings(patch: Partial<Settings>): Promise<Res> {
  const columns: Record<keyof Settings, string> = {
    companyName: 'company_name', address: 'address', phone: 'phone', whatsapp: 'whatsapp',
    email: 'email', instagram: 'instagram', facebook: 'facebook', linkedin: 'linkedin',
    youtube: 'youtube', upiId: 'upi_id', bankName: 'bank_name', accountHolder: 'account_holder',
    accountNumber: 'account_number', ifsc: 'ifsc', theme: 'theme',
  };
  const body: Row = { id: 1 };
  for (const key of Object.keys(patch) as (keyof Settings)[]) if (patch[key] !== undefined) body[columns[key]] = patch[key];
  try {
    await request('business_settings?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(body),
    });
    return { ok: true };
  } catch { return genericWriteError('Settings'); }
}

const MEDIA_LIMITS = { label: 80, alt: 180 };

function safeMediaUrl(raw: string, kind: 'image' | 'video'): string | null {
  const url = raw.trim();
  if (url.length === 0 || url.length > 1200) return null;
  if (!/^https:\/\//i.test(url) && !url.startsWith('/')) return null;
  if (kind === 'video' && !/\.(mp4|webm)(\?|$)/i.test(url)) return null;
  return url;
}

export async function listMedia(): Promise<MediaAsset[]> {
  const { data } = await selectRows('business_media', { order: 'sort_order.asc,id.asc' });
  const saved = new Map(data.map((row) => [asText(row.id), mapMedia(row)]));
  // Saved values apply only when they are filled in, so a blank field never erases a default.
  const defaults = MEDIA_DEFAULTS.map((item) => {
    const stored = saved.get(item.id);
    if (!stored) return { ...item };
    return {
      ...item,
      url: stored.url || item.url,
      alt: stored.alt || item.alt,
      label: stored.label || item.label,
      posterUrl: stored.posterUrl || item.posterUrl,
    };
  });
  const custom = data.filter((row) => row.is_custom === true).map(mapMedia).filter((item) => item.url);
  return [...defaults, ...custom];
}

/** Replaces the file (and optionally the poster or alt text) used by a built-in website slot. */
export async function saveMedia(input: { id: string; url: string; alt?: string; posterUrl?: string }): Promise<Res> {
  const item = MEDIA_DEFAULTS.find((entry) => entry.id === input.id);
  if (!item) return { error: 'Media item not found' };
  const url = safeMediaUrl(input.url, item.kind);
  if (!url) return { error: item.kind === 'video' ? 'Choose an MP4 or WebM video file.' : 'Choose an image file or use an https:// address.' };
  const body: Row = {
    id: item.id, label: item.label, kind: item.kind, url,
    alt: (input.alt ?? '').trim().slice(0, MEDIA_LIMITS.alt) || item.alt,
    sort_order: MEDIA_DEFAULTS.findIndex((asset) => asset.id === item.id),
    is_custom: false,
  };
  if (input.posterUrl !== undefined) body.poster_url = input.posterUrl.trim().slice(0, 1200);
  try {
    await request('business_media?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(body),
    });
    return { ok: true };
  } catch { return genericWriteError('Media'); }
}

/** Adds a new image or video to the library. It appears in the portfolio gallery. */
export async function addCustomMedia(input: { label: string; kind: 'image' | 'video'; url: string; alt: string }): Promise<Res> {
  const label = input.label.trim();
  if (label.length < 2) return { error: 'Give the item a short name (at least 2 letters).' };
  if (label.length > MEDIA_LIMITS.label) return { error: 'Keep the name under 80 characters.' };
  const url = safeMediaUrl(input.url, input.kind);
  if (!url) return { error: input.kind === 'video' ? 'Upload an MP4 or WebM video.' : 'Upload an image file.' };
  const id = 'custom_' + randomUUID().slice(0, 12);
  try {
    await request('business_media', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        id, label, kind: input.kind, url, alt: input.alt.trim().slice(0, MEDIA_LIMITS.alt) || label,
        sort_order: 1000, is_custom: true, poster_url: '',
      }),
    });
    return { ok: true };
  } catch { return genericWriteError('Media'); }
}

/** Deletes an admin-added item. Built-in website slots can only be replaced, never removed. */
export async function deleteCustomMedia(id: string): Promise<Res & { url?: string }> {
  if (!/^custom_[a-f0-9-]{6,40}$/i.test(id)) return { error: 'Only added media can be deleted.' };
  try {
    const { data } = await selectRows('business_media', { id: `eq.${id}`, is_custom: 'eq.true', limit: 1 });
    const url = data[0] ? asText(data[0].url) : '';
    await request(`business_media?id=eq.${encodeURIComponent(id)}&is_custom=eq.true`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    return { ok: true, url };
  } catch { return genericWriteError('Media'); }
}

// ---------- Packages ----------
export async function listPackages(includeInactive = false): Promise<Pkg[]> {
  const { data } = await selectRows('business_packages', {
    ...(includeInactive ? {} : { active: 'eq.true' }),
    order: 'sort_order.asc,name.asc',
  });
  return data.map(mapPackage);
}

export async function getPackageBySlug(slug: string): Promise<Pkg | undefined> {
  const { data } = await selectRows('business_packages', { slug: 'eq.' + slug, active: 'eq.true', limit: 1 });
  return data[0] ? mapPackage(data[0]) : undefined;
}

export interface PkgInput {
  id?: string;
  slug: string;
  name: string;
  durationMonths: number;
  price: number;
  videos: number;
  posters: number;
  deliverables: string[];
  featured: boolean;
  active: boolean;
  sortOrder: number;
}

export async function savePackage(input: PkgInput): Promise<Res> {
  try {
    const result = await rpc<unknown>('save_business_package', {
      p_id: input.id || null,
      p_slug: input.slug.trim(),
      p_name: input.name.trim(),
      p_duration_months: input.durationMonths,
      p_price: input.price,
      p_videos: input.videos,
      p_posters: input.posters,
      p_deliverables: input.deliverables,
      p_featured: input.featured,
      p_active: input.active,
      p_sort_order: input.sortOrder,
    });
    return rpcResult(result);
  } catch { return genericWriteError('Package'); }
}

export async function deletePackage(id: string): Promise<Res> {
  if (!isUuid(id)) return { error: 'Package not found' };
  try { return rpcResult(await rpc('delete_business_package', { p_id: id })); }
  catch { return genericWriteError('Package'); }
}

// ---------- Portfolio ----------
export async function listPortfolio(publishedOnly = false): Promise<PortfolioItem[]> {
  const { data } = await selectRows('business_portfolio', {
    ...(publishedOnly ? { published: 'eq.true' } : {}),
    order: 'sort_order.asc,created_at.asc',
  });
  return data.map(mapPortfolio);
}

export interface PortfolioInput {
  id?: string;
  title: string;
  category: Category;
  thumbUrl: string;
  videoUrl: string;
  published: boolean;
  sortOrder: number;
  slug?: string;
  clientName?: string;
  challenge?: string;
  solution?: string;
  result?: string;
}

/** Lowercase letters, numbers and dashes only, used in the case study web address. */
export function normalizeSlug(value: string | undefined): string {
  return (value ?? '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
  const clean = normalizeSlug(slug);
  if (!clean) return null;
  const { data } = await selectRows('business_portfolio', { slug: `eq.${clean}`, published: 'eq.true', limit: 1 });
  return data[0] ? mapPortfolio(data[0]) : null;
}

export async function savePortfolio(input: PortfolioInput): Promise<Res> {
  if (!input.title.trim()) return { error: 'Title is required' };
  try {
    let sortOrder = input.sortOrder;
    if (!input.id && sortOrder <= 0) {
      const current = await listPortfolio();
      sortOrder = Math.max(0, ...current.map((item) => item.sortOrder)) + 1;
    }
    const row: Row = {
      title: input.title.trim(),
      category: input.category,
      thumb_url: input.thumbUrl.trim(),
      video_url: input.videoUrl.trim(),
      published: input.published,
      sort_order: sortOrder,
      slug: normalizeSlug(input.slug) || null,
      client_name: (input.clientName ?? '').trim().slice(0, 120),
      challenge: (input.challenge ?? '').trim().slice(0, 1500),
      solution: (input.solution ?? '').trim().slice(0, 1500),
      result: (input.result ?? '').trim().slice(0, 1000),
    };
    const resource = input.id ? 'business_portfolio?id=eq.' + encodeURIComponent(input.id) : 'business_portfolio';
    if (input.id) {
      await request(resource, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) });
    } else {
      await request(resource, { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) });
    }
    return { ok: true };
  } catch { return genericWriteError('Portfolio item'); }
}

export async function deletePortfolio(id: string): Promise<Res> {
  if (!isUuid(id)) return { error: 'Portfolio item not found' };
  try {
    await request('business_portfolio?id=eq.' + encodeURIComponent(id), { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    return { ok: true };
  } catch { return genericWriteError('Portfolio item'); }
}

export async function movePortfolio(id: string, dir: 'up' | 'down'): Promise<Res> {
  if (!isUuid(id)) return { error: 'Portfolio item not found' };
  try {
    await rpc('move_business_portfolio', { p_id: id, p_direction: dir });
    return { ok: true };
  } catch { return genericWriteError('Portfolio order'); }
}

// ---------- Orders ----------
export interface OrderInput {
  packageSlug: string;
  name: string;
  mobile: string;
  email: string;
  business: string;
  city: string;
  goal: string;
  startDate: string;
  gst: string;
  agree: boolean;
}

export async function createOrder(input: OrderInput): Promise<{ error: string } | { orderNumber: string; receiptToken: string }> {
  const name = input.name.trim();
  const mobile = input.mobile.trim();
  const email = input.email.trim();
  const business = input.business.trim();
  const city = input.city.trim();
  const goal = input.goal.trim();
  const gst = input.gst.trim().toUpperCase();
  if (name.length < 2) return { error: 'Please enter your full name' };
  if (!MOBILE.test(mobile)) return { error: 'Mobile number must be exactly 10 digits' };
  if (email && !EMAIL.test(email)) return { error: 'Email address looks invalid' };
  if (!business) return { error: 'Business name is required' };
  if (!city) return { error: 'City is required' };
  if (goal.length > 500) return { error: 'Goal must be under 500 characters' };
  if (input.startDate && input.startDate < today()) return { error: 'Start date cannot be in the past' };
  if (gst && !GST.test(gst)) return { error: 'GST number must be 15 characters' };
  if (!input.agree) return { error: 'Please accept the terms to continue' };

  try {
    const raw = await rpc<unknown>('create_business_order', {
      p_package_slug: input.packageSlug,
      p_customer_name: name,
      p_customer_mobile: mobile,
      p_customer_email: email,
      p_business: business,
      p_city: city,
      p_goal: goal,
      p_start_date: input.startDate || null,
      p_gst: gst,
    });
    const row = Array.isArray(raw) ? raw[0] as Row | undefined : undefined;
    if (!row?.order_number || !row.receipt_token) return { error: 'Order could not be saved. Please try again shortly.' };
    return { orderNumber: asText(row.order_number), receiptToken: asText(row.receipt_token) };
  } catch (error) {
    if (error instanceof DatabaseError && error.serverMessage.includes('PACKAGE_UNAVAILABLE')) return { error: 'This package is not available' };
    return { error: 'Order could not be saved right now. Please try again shortly.' };
  }
}

export interface OrderListOpts {
  status?: string;
  q?: string;
  page?: number;
}

export async function listOrders(opts: OrderListOpts = {}) {
  const page = Math.max(1, Math.floor(opts.page || 1));
  const params: Record<string, string | number | undefined> = { order: 'created_at.desc' };
  if (opts.status && opts.status !== 'all' && ORDER_STATUSES.includes(opts.status as OrderStatus)) params.status = 'eq.' + opts.status;
  const q = (opts.q || '').replace(/[^\p{L}\p{N}\s@._+-]/gu, ' ').trim().slice(0, 80);
  if (q) params.or = '(order_number.ilike.*' + q + '*,customer_name.ilike.*' + q + '*,customer_mobile.ilike.*' + q + '*)';
  const start = (page - 1) * PAGE_SIZE;
  const { data, headers } = await selectRows('business_orders', params, [start, start + PAGE_SIZE - 1]);
  const match = (headers.get('content-range') || '').match(/\/(\d+|\*)$/);
  const total = match && match[1] !== '*' ? Number(match[1]) : data.length;
  const rows = data.map(mapOrder);
  const payments = rows.length ? await allRows('business_payments', { order_id: 'in.(' + rows.map((o) => o.id).join(',') + ')' }) : [];
  const totals = paymentTotals(payments.map(mapPayment));
  return {
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    rows: rows.map((order) => withTotals(order, totals)),
  };
}

async function orderByFilter(filter: string, value: string): Promise<OrderView | undefined> {
  if (!isUuid(value)) return undefined;
  const { data } = await selectRows('business_orders', { [filter]: 'eq.' + value, limit: 1 });
  if (!data[0]) return undefined;
  const order = mapOrder(data[0]);
  const payments = await getPayments(order.id);
  return withTotals(order, paymentTotals(payments));
}

export async function getOrder(id: string): Promise<OrderView | undefined> {
  return orderByFilter('id', id);
}

export async function getOrderByNumber(receiptToken: string): Promise<OrderView | undefined> {
  return orderByFilter('receipt_token', receiptToken);
}

export async function getPayments(orderId: string): Promise<Payment[]> {
  if (!isUuid(orderId)) return [];
  const { data } = await selectRows('business_payments', {
    order_id: 'eq.' + orderId,
    order: 'received_on.desc,created_at.desc',
  });
  return data.map(mapPayment);
}

export async function setStatus(id: string, next: OrderStatus, reason = ''): Promise<Res> {
  if (!isUuid(id) || !ORDER_STATUSES.includes(next)) return { error: 'Order not found' };
  try {
    return rpcResult(await rpc('set_business_order_status', { p_order_id: id, p_next_status: next, p_reason: reason.trim() }));
  } catch { return genericWriteError('Order status'); }
}

export async function addPayment(
  orderId: string,
  input: { amount: number; method: PayMethod; reference: string; receivedOn: string; note: string },
): Promise<Res> {
  if (!isUuid(orderId)) return { error: 'Order not found' };
  if (!Number.isFinite(input.amount) || input.amount <= 0) return { error: 'Amount must be more than 0' };
  if (!['upi', 'bank_transfer', 'cash', 'other'].includes(input.method)) return { error: 'Choose a valid payment method' };
  try {
    return rpcResult(await rpc('add_business_payment', {
      p_order_id: orderId,
      p_amount: input.amount,
      p_method: input.method,
      p_reference: input.reference.trim().slice(0, 200),
      p_received_on: input.receivedOn || today(),
      p_note: input.note.trim().slice(0, 500),
    }));
  } catch { return genericWriteError('Payment'); }
}

export async function activateOrder(orderId: string, startDate: string): Promise<Res> {
  if (!isUuid(orderId)) return { error: 'Order not found' };
  if (!startDate) return { error: 'Start date is required' };
  try {
    return rpcResult(await rpc('activate_business_order', { p_order_id: orderId, p_start_date: startDate }));
  } catch { return genericWriteError('Campaign'); }
}

export async function updateOrder(id: string, patch: { notes?: string; agreementSigned?: boolean }): Promise<Res> {
  if (!isUuid(id)) return { error: 'Order not found' };
  try {
    return rpcResult(await rpc('update_business_order_details', {
      p_order_id: id,
      p_notes: patch.notes === undefined ? null : patch.notes.slice(0, 5000),
      p_agreement_signed: patch.agreementSigned === undefined ? null : patch.agreementSigned,
    }));
  } catch { return genericWriteError('Order details'); }
}

// ---------- Clients ----------
export async function listClients(): Promise<Client[]> {
  const rows = await allRows('business_clients', { order: 'created_at.desc' });
  return rows.map(mapClient);
}

export async function listClientRows(): Promise<ClientRow[]> {
  const [clientRows, packageRows] = await Promise.all([
    allRows('business_clients'),
    allRows('business_client_packages', { order: 'end_date.asc' }),
  ]);
  const clients = new Map(clientRows.map((row) => {
    const client = mapClient(row);
    return [client.id, client] as const;
  }));
  return packageRows.map((row) => {
    const cp = mapClientPackage(row);
    return { cp, client: clients.get(cp.clientId) };
  }).sort((a, b) => a.cp.endDate.localeCompare(b.cp.endDate));
}

export async function bumpQuota(cpId: string, kind: 'video' | 'poster'): Promise<Res> {
  if (!isUuid(cpId)) return { error: 'Package not found' };
  try { return rpcResult(await rpc('bump_business_quota', { p_client_package_id: cpId, p_kind: kind })); }
  catch { return genericWriteError('Quota'); }
}

// ---------- Enquiries ----------
export async function addEnquiry(input: { name: string; mobile: string; message: string; email?: string; business?: string; budget?: string; services?: string[] }): Promise<Res> {
  const name = input.name.trim();
  const mobile = input.mobile.trim();
  const email = input.email?.trim() || '';
  if (name.length < 2) return { error: 'Please enter your name' };
  if (!MOBILE.test(mobile)) return { error: 'Mobile number must be exactly 10 digits' };
  if (email && !EMAIL.test(email)) return { error: 'Please enter a valid email address' };
  try {
    await request('business_enquiries', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        name,
        mobile,
        message: input.message.trim().slice(0, 500),
        email: email.slice(0, 120),
        business: input.business?.trim().slice(0, 120) || '',
        budget: input.budget?.trim().slice(0, 80) || '',
        services: (input.services || []).map((service) => service.slice(0, 80)).slice(0, 8),
      }),
    });
    return { ok: true };
  } catch { return genericWriteError('Enquiry'); }
}

export async function listEnquiries(status = 'all'): Promise<Enquiry[]> {
  const validStatus = status === 'new' || status === 'done' ? status : undefined;
  const rows = await allRows('business_enquiries', {
    ...(validStatus ? { status: 'eq.' + validStatus } : {}),
    order: 'created_at.desc',
  });
  return rows.map(mapEnquiry);
}

export async function markEnquiryDone(id: string): Promise<Res> {
  if (!isUuid(id)) return { error: 'Enquiry not found' };
  try {
    await request('business_enquiries?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'done' }),
    });
    return { ok: true };
  } catch { return genericWriteError('Enquiry'); }
}

// ---------- Meta Ads log ----------
export async function listMeta(month = '') {
  const [metaRows, clients] = await Promise.all([allRows('business_meta_entries', { order: 'created_at.desc' }), listClients()]);
  const clientNames = new Map(clients.map((client) => [client.id, client.name]));
  const rows = metaRows
    .filter((row) => !month || asDate(row.start_date).startsWith(month))
    .map((row) => mapMeta(row, clientNames.get(asText(row.client_id)) || '-'));
  return {
    rows,
    budget: rows.reduce((sum, row) => sum + row.budget, 0),
    spend: rows.reduce((sum, row) => sum + row.spend, 0),
    leads: rows.reduce((sum, row) => sum + row.leads, 0),
  };
}

export async function addMeta(input: Omit<MetaEntry, 'id'>): Promise<Res> {
  if (!input.clientId) return { error: 'Select a client' };
  if (!isUuid(input.clientId)) return { error: 'Select a valid client' };
  if (!input.campaign.trim()) return { error: 'Campaign name is required' };
  if (input.budget < 0 || input.spend < 0 || input.leads < 0) return { error: 'Amounts and leads cannot be negative' };
  try {
    await request('business_meta_entries', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        client_id: input.clientId,
        campaign: input.campaign.trim().slice(0, 160),
        start_date: input.startDate || null,
        end_date: input.endDate || null,
        budget: input.budget,
        spend: input.spend,
        leads: Math.floor(input.leads),
        notes: input.notes.trim().slice(0, 2000),
      }),
    });
    return { ok: true };
  } catch { return genericWriteError('Ad log entry'); }
}

// ---------- Dashboard and reports ----------
export async function dashboardStats() {
  const [orderRows, paymentRows, clientRows, clientPackageRows, enquiryRows] = await Promise.all([
    allRows('business_orders', { order: 'created_at.desc' }),
    allRows('business_payments', { order: 'received_on.desc' }),
    allRows('business_clients'),
    allRows('business_client_packages', { order: 'end_date.asc' }),
    allRows('business_enquiries', { order: 'created_at.desc' }),
  ]);
  const orders = orderRows.map(mapOrder);
  const payments = paymentRows.map(mapPayment);
  const totals = paymentTotals(payments);
  const clients = new Map(clientRows.map((row) => {
    const client = mapClient(row);
    return [client.id, client] as const;
  }));
  const rows: ClientRow[] = clientPackageRows.map((row) => {
    const cp = mapClientPackage(row);
    return { cp, client: clients.get(cp.clientId) };
  });
  const t = today();
  const month = t.slice(0, 7);
  const expiring = rows.filter((row) => {
    const days = daysUntil(row.cp.endDate);
    return days >= 0 && days <= 7;
  });
  const quotaFull = rows.filter((row) => row.cp.videosUsed >= row.cp.videosTotal || row.cp.postersUsed >= row.cp.postersTotal);
  const stale = orders.filter((order) => order.status === 'new' && Date.now() - Date.parse(order.createdAt) > 24 * 3600 * 1000)
    .map((order) => withTotals(order, totals));
  return {
    newOrders: orders.filter((order) => order.status === 'new').length,
    awaiting: orders.filter((order) => order.status === 'confirmed').length,
    revenue: payments.filter((payment) => payment.receivedOn.startsWith(month)).reduce((sum, payment) => sum + payment.amount, 0),
    activeClients: rows.filter((row) => row.cp.endDate >= t).length,
    newEnquiries: enquiryRows.filter((row) => row.status === 'new').length,
    expiring,
    quotaFull,
    stale,
  };
}

export async function revenueByMonth(): Promise<[string, number][]> {
  const payments = (await allRows('business_payments')).map(mapPayment);
  const totals = new Map<string, number>();
  for (const payment of payments) {
    const month = payment.receivedOn.slice(0, 7);
    totals.set(month, (totals.get(month) || 0) + payment.amount);
  }
  return [...totals.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export async function countBy(field: 'status' | 'package'): Promise<[string, number][]> {
  const orders = (await allRows('business_orders')).map(mapOrder);
  const counts = new Map<string, number>();
  for (const order of orders) {
    const key = field === 'status' ? order.status : order.snapshot.name;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function csvCell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

export async function ordersCsv(): Promise<string> {
  const orders = (await allRows('business_orders', { order: 'created_at.desc' })).map(mapOrder);
  const ids = orders.map((order) => order.id);
  const payments = ids.length
    ? (await allRows('business_payments', { order_id: 'in.(' + ids.join(',') + ')' })).map(mapPayment)
    : [];
  const totals = paymentTotals(payments);
  const head = ['Order', 'Date', 'Customer', 'Mobile', 'Business', 'Package', 'Price', 'Paid', 'Balance', 'Status'];
  const lines = orders.map((order) => {
    const view = withTotals(order, totals);
    return [
      order.orderNumber, order.createdAt.slice(0, 10), order.customerName, order.customerMobile,
      order.business, order.snapshot.name, order.priceAmount, view.paid, view.balance, order.status,
    ].map(csvCell).join(',');
  });
  return [head.join(','), ...lines].join('\r\n');
}


// ---------- Team accounts and order assignment ----------
export type Staff = { id: string; email: string; name: string; role: RoleKey; active: boolean; createdAt: string };
type StaffWithHash = Staff & { passwordHash: string };

function mapStaff(row: Row): Staff {
  const role = asText(row.role) as RoleKey;
  return {
    id: asText(row.id),
    email: asText(row.email),
    name: asText(row.name),
    role: (ROLE_KEYS as readonly string[]).includes(role) ? role : 'designer',
    active: row.active !== false,
    createdAt: asText(row.created_at),
  };
}

export async function listStaff(): Promise<Staff[]> {
  const { data } = await selectRows('business_staff', { order: 'created_at.asc' });
  return data.map(mapStaff);
}

export async function getStaffById(id: string): Promise<Staff | null> {
  if (!isUuid(id)) return null;
  const { data } = await selectRows('business_staff', { id: `eq.${id}`, limit: 1 });
  return data[0] ? mapStaff(data[0]) : null;
}

export async function findStaffByEmail(email: string): Promise<StaffWithHash | null> {
  const clean = email.trim().toLowerCase();
  if (!clean || clean.length > 200) return null;
  const { data } = await selectRows('business_staff', { email: `eq.${clean}`, limit: 1 });
  return data[0] ? { ...mapStaff(data[0]), passwordHash: asText(data[0].password_hash) } : null;
}

export async function createStaff(input: { name: string; email: string; role: RoleKey; password: string }): Promise<Res> {
  try {
    await request('business_staff', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        name: input.name.trim().slice(0, 80),
        email: input.email.trim().toLowerCase().slice(0, 200),
        role: input.role,
        password_hash: await hashPassword(input.password),
      }),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && /duplicate|23505|409/i.test(error.message)) return { error: 'That email already has an account.' };
    return genericWriteError('Team member');
  }
}

export async function updateStaff(id: string, patch: { role?: RoleKey; active?: boolean; password?: string; name?: string }): Promise<Res> {
  if (!isUuid(id)) return { error: 'Team member not found' };
  const body: Row = {};
  if (patch.role) body.role = patch.role;
  if (patch.active !== undefined) body.active = patch.active;
  if (patch.name) body.name = patch.name.trim().slice(0, 80);
  if (patch.password) body.password_hash = await hashPassword(patch.password);
  if (Object.keys(body).length === 0) return { ok: true };
  try {
    await request(`business_staff?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(body) });
    return { ok: true };
  } catch { return genericWriteError('Team member'); }
}

export async function assignOrder(orderId: string, staffId: string | null): Promise<Res> {
  if (!isUuid(orderId)) return { error: 'Order not found' };
  if (staffId !== null && !isUuid(staffId)) return { error: 'Choose a valid team member' };
  try {
    await request(`business_orders?id=eq.${orderId}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ assigned_to: staffId }) });
    return { ok: true };
  } catch { return genericWriteError('Assignment'); }
}

export async function orderAssigneeId(orderId: string): Promise<string | null> {
  if (!isUuid(orderId)) return null;
  const { data } = await selectRows('business_orders', { id: `eq.${orderId}`, select: 'assigned_to', limit: 1 });
  return data[0] ? asText(data[0].assigned_to) || null : null;
}

export async function listAssignedOrders(staffId: string): Promise<Order[]> {
  if (!isUuid(staffId)) return [];
  const { data } = await selectRows('business_orders', { assigned_to: `eq.${staffId}`, order: 'created_at.desc', limit: 200 });
  return data.map(mapOrder);
}

/** Saves the cover photo and video for a package. Empty values clear them. */
export async function setPackageMedia(slug: string, input: { coverUrl: string; coverVideoUrl: string }): Promise<Res> {
  const cover = input.coverUrl.trim() ? safeMediaUrl(input.coverUrl, 'image') : '';
  const video = input.coverVideoUrl.trim() ? safeMediaUrl(input.coverVideoUrl, 'video') : '';
  if (cover === null) return { error: 'Choose a JPG, PNG, WebP or GIF image for the cover.' };
  if (video === null) return { error: 'Choose an MP4 or WebM video for the package.' };
  try {
    await request(`business_packages?slug=eq.${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify({ cover_url: cover, cover_video_url: video, updated_at: new Date().toISOString() }),
      headers: { Prefer: 'return=minimal' },
    });
    return { ok: true };
  } catch { return genericWriteError('Package media'); }
}
