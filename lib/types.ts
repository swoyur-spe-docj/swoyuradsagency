export type ThemeKey = 'corporate_blue' | 'emerald_growth';
export type OrderStatus = 'new' | 'contacted' | 'confirmed' | 'paid' | 'active' | 'completed' | 'cancelled';
export type PayMethod = 'upi' | 'bank_transfer' | 'cash' | 'other';
export type Category = 'Video' | 'Poster' | 'Influencer' | 'Meta Ads';

export const CATEGORIES: Category[] = ['Video', 'Poster', 'Influencer', 'Meta Ads'];
export const PAY_METHODS: PayMethod[] = ['upi', 'bank_transfer', 'cash', 'other'];
export const PAY_LABEL: Record<PayMethod, string> = {
  upi: 'UPI',
  bank_transfer: 'Bank transfer',
  cash: 'Cash',
  other: 'Other',
};

export interface Settings {
  companyName: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  upiId: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  theme: ThemeKey;
}

export interface Pkg {
  id: string;
  slug: string;
  name: string;
  durationMonths: number;
  price: number;
  videos: number;
  posters: number;
  deliverables: string[];
  coverUrl: string;
  coverVideoUrl: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
}

export interface Snapshot {
  name: string;
  price: number;
  videos: number;
  posters: number;
  durationMonths: number;
  deliverables: string[];
  coverUrl: string;
  coverVideoUrl: string;
}

export interface OrderEvent {
  at: string;
  text: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  packageId: string;
  snapshot: Snapshot;
  priceAmount: number;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  business: string;
  city: string;
  goal: string;
  startDate: string;
  gst: string;
  status: OrderStatus;
  cancelReason: string;
  notes: string;
  agreementSigned: boolean;
  clientId: string;
  assignedTo: string | null;
  createdAt: string;
  events: OrderEvent[];
}

export type OrderView = Order & { paid: number; balance: number };

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PayMethod;
  reference: string;
  receivedOn: string;
  note: string;
}

export interface Client {
  id: string;
  name: string;
  business: string;
  city: string;
  mobile: string;
  email: string;
}

export interface ClientPackage {
  id: string;
  clientId: string;
  orderId: string;
  packageName: string;
  startDate: string;
  endDate: string;
  videosTotal: number;
  videosUsed: number;
  postersTotal: number;
  postersUsed: number;
}

export interface ClientRow {
  cp: ClientPackage;
  client?: Client;
}

export interface Enquiry {
  id: string;
  name: string;
  mobile: string;
  message: string;
  email?: string;
  business?: string;
  budget?: string;
  services?: string[];
  status: 'new' | 'done';
  createdAt: string;
}

export interface MetaEntry {
  id: string;
  clientId: string;
  campaign: string;
  startDate: string;
  endDate: string;
  budget: number;
  spend: number;
  leads: number;
  notes: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: Category;
  thumbUrl: string;
  videoUrl: string;
  published: boolean;
  sortOrder: number;
  slug: string;
  clientName: string;
  challenge: string;
  solution: string;
  result: string;
}

export interface Db {
  settings: Settings;
  packages: Pkg[];
  orders: Order[];
  payments: Payment[];
  clients: Client[];
  clientPackages: ClientPackage[];
  enquiries: Enquiry[];
  meta: MetaEntry[];
  portfolio: PortfolioItem[];
  media: import('./media').MediaAsset[];
  seq: number;
  nid: number;
}

export type Res = { ok: true } | { error: string };
