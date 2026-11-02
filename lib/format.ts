// Indian number grouping: 120000 -> ₹1,20,000
export function inr(n: number): string {
  const s = String(Math.round(n));
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return '₹' + (rest ? rest + ',' : '') + last3;
}

const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
/** Today's date (YYYY-MM-DD) in India time, so the checkout minimum date matches the server check after 00:00 IST. */
export const today = (): string => dateFormatter.format(new Date());

export function addMonths(date: string, months: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(date: string): number {
  return Math.round((Date.parse(date + 'T00:00:00Z') - Date.parse(today() + 'T00:00:00Z')) / 86400000);
}

export function fmtDate(value: string): string {
  const d = value.length === 10 ? new Date(value + 'T00:00:00Z') : new Date(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
