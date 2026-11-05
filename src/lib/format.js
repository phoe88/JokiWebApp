const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const idrCompact = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const count = new Intl.NumberFormat('id-ID');

const clock = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const fullDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const DAY_MS = 24 * 60 * 60 * 1000;

export const formatIDR = (value) => idr.format(Number(value) || 0);
export const formatIDRCompact = (value) => idrCompact.format(Number(value) || 0);
export const formatCount = (value) => count.format(value);
export const formatClock = (value) => clock.format(new Date(value));
export const formatDayMonth = (value) => dayMonth.format(new Date(value));
export const formatFullDate = (value) => fullDate.format(new Date(value));
export const formatPercent = (share) => `${Math.round(share * 100)}%`;
export const shortId = (id) => String(id).slice(0, 8).toUpperCase();

export function formatAgo(value, now = Date.now()) {
  const days = Math.round((new Date(value).getTime() - now) / DAY_MS);
  if (Math.abs(days) < 1) return 'today';
  if (Math.abs(days) < 30) return relative.format(days, 'day');
  return relative.format(Math.round(days / 30), 'month');
}
