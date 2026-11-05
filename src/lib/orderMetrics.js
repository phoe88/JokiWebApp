/**
 * Pure calculations behind the Dashboard and the Pricing tiers.
 * Everything here derives from real rows: orders and the catalog. It has no
 * imports and takes `now` as an argument, so results depend only on the inputs.
 *
 * The orders table stores no price. An order's value is the current price of its
 * service, so every figure built from it is an estimate at current prices.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_POINTS = 12;

export const startOfDay = (date) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
};

/** Calendar arithmetic, so a daylight saving change can't shift a bucket edge. */
export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toPrice = (value) => {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
};

const placedAt = (order) => new Date(order.created_at).getTime();
const orderValue = (order) => order.value ?? 0;

/**
 * Adds `service` and `value` to each order. Rows straight off Realtime carry only
 * service_id, so the catalog is the first source. The joined service is the
 * fallback while the catalog is still loading.
 */
export function resolveOrders(orders, services) {
  const catalog = new Map(services.map((service) => [service.id, service]));
  return orders.map((order) => {
    const service = catalog.get(order.service_id) ?? order.service ?? null;
    return { ...order, service, value: service ? toPrice(service.price) : null };
  });
}

export function summarizeOrders(orders) {
  const tally = (status) => orders.filter((order) => order.status === status);
  const completed = tally('completed');
  const pending = tally('pending').length;
  const inProgress = tally('in_progress').length;

  return {
    count: orders.length,
    pending,
    inProgress,
    open: pending + inProgress,
    completed: completed.length,
    value: orders.reduce((sum, order) => sum + orderValue(order), 0),
    completedValue: completed.reduce((sum, order) => sum + orderValue(order), 0),
    unpriced: orders.filter((order) => order.value === null || order.value === undefined).length,
    completionShare: orders.length ? completed.length / orders.length : 0,
  };
}

export const RANGES = [
  { id: '1M', label: '1M', name: 'the last month', days: 30, step: 5 },
  { id: '3M', label: '3M', name: 'the last 3 months', days: 91, step: 7 },
  { id: '6M', label: '6M', name: 'the last 6 months', days: 182, step: 14 },
  { id: 'ALL', label: 'All', name: 'all time', days: null, step: null },
];

export const DEFAULT_RANGE = '6M';

/** Windows are whole days ending tonight, so today's orders always land in the last one. */
const windowEnd = (now) => addDays(startOfDay(now), 1);

function rangeShape(range, orders, end) {
  if (range.days) return { step: range.step, count: Math.round(range.days / range.step) };

  const first = orders.reduce((earliest, order) => Math.min(earliest, placedAt(order)), end.getTime());
  const span = Math.max(Math.ceil((end.getTime() - first) / DAY_MS), TREND_POINTS);
  const step = Math.ceil(span / TREND_POINTS);
  return { step, count: Math.ceil(span / step) };
}

function emptyBuckets(count, step, end) {
  return Array.from({ length: count }, (_, index) => {
    const bucketEnd = addDays(end, -(count - 1 - index) * step);
    return { start: addDays(bucketEnd, -step), end: bucketEnd, step, count: 0, placed: 0, completed: 0 };
  });
}

/**
 * Groups orders by the date they were placed. There is no completion timestamp,
 * so `completed` means "placed in this window and completed by now".
 */
export function buildTrend(orders, rangeId, now = new Date()) {
  const range = RANGES.find(({ id }) => id === rangeId) ?? RANGES[RANGES.length - 1];
  const end = windowEnd(now);
  const { step, count } = rangeShape(range, orders, end);
  const buckets = emptyBuckets(count, step, end);
  const start = buckets[0].start.getTime();
  const span = end.getTime() - start;

  const previous = { count: 0, placed: 0 };
  const totals = { count: 0, placed: 0, completed: 0 };

  for (const order of orders) {
    const at = placedAt(order);

    if (at >= start && at < end.getTime()) {
      const bucket = buckets.find((candidate) => at >= candidate.start.getTime() && at < candidate.end.getTime());
      if (!bucket) continue;
      const value = orderValue(order);
      bucket.count += 1;
      bucket.placed += value;
      totals.count += 1;
      totals.placed += value;
      if (order.status === 'completed') {
        bucket.completed += value;
        totals.completed += value;
      }
    } else if (range.days && at < start && at >= start - span) {
      previous.count += 1;
      previous.placed += orderValue(order);
    }
  }

  const hasPrevious = Boolean(range.days) && orders.some((order) => placedAt(order) < start);
  return { range, buckets, totals, previous: hasPrevious ? previous : null };
}

/** One number per trailing week, oldest first, for a stat tile's sparkline. */
export function weeklySeries(orders, { weeks = TREND_POINTS, now = new Date(), measure = () => 1 } = {}) {
  const buckets = emptyBuckets(weeks, 7, windowEnd(now));
  const values = new Array(weeks).fill(0);

  for (const order of orders) {
    const at = placedAt(order);
    const index = buckets.findIndex(({ start, end }) => at >= start.getTime() && at < end.getTime());
    if (index >= 0) values[index] += measure(order);
  }

  return values;
}

/**
 * Compares the last `days` days with the `days` before them. Returns null when
 * nothing is older than the window, because "up from nothing" would be a false
 * trend for an account that has only just started.
 */
export function periodChange(orders, { days = 30, now = new Date(), measure = () => 1 } = {}) {
  const end = windowEnd(now);
  const split = addDays(end, -days).getTime();
  const floor = addDays(end, -days * 2).getTime();
  if (!orders.some((order) => placedAt(order) < split)) return null;

  let current = 0;
  let previous = 0;
  for (const order of orders) {
    const at = placedAt(order);
    if (at >= split) current += measure(order);
    else if (at >= floor) previous += measure(order);
  }

  return { current, previous, change: current - previous, days };
}

/** Categories ranked by estimated value, largest first. */
export function categoryBreakdown(orders) {
  const groups = new Map();

  for (const order of orders) {
    const name = order.service?.category;
    if (!name) continue;
    const group = groups.get(name) ?? { name, count: 0, value: 0 };
    group.count += 1;
    group.value += orderValue(order);
    groups.set(name, group);
  }

  const total = [...groups.values()].reduce((sum, group) => sum + group.value, 0);
  return [...groups.values()]
    .map((group) => ({ ...group, share: total ? group.value / total : 0 }))
    .sort((a, b) => b.value - a.value || b.count - a.count || a.name.localeCompare(b.name));
}

/** The order worth watching: the newest one in progress, or else the oldest still waiting. */
export function focusOrder(orders) {
  const newestFirst = [...orders].sort((a, b) => placedAt(b) - placedAt(a));
  return (
    newestFirst.find((order) => order.status === 'in_progress') ??
    newestFirst.reverse().find((order) => order.status === 'pending') ??
    null
  );
}

const TIER_NAMES = ['Essentials', 'Standard', 'Flagship'];

/**
 * Splits the catalog by price into up to three even bands. The bands are computed,
 * so the tiers can never list a package or a price the catalog doesn't have.
 */
export function pricingTiers(services) {
  const sorted = services
    .map((service) => ({ ...service, price: toPrice(service.price) }))
    .filter((service) => service.price !== null)
    .sort((a, b) => a.price - b.price);

  const bands = Math.min(TIER_NAMES.length, sorted.length);
  const names = bands === TIER_NAMES.length ? TIER_NAMES : [TIER_NAMES[0], TIER_NAMES[2]].slice(0, bands);

  return names.map((name, index) => {
    const items = sorted.slice(
      Math.round((index * sorted.length) / bands),
      Math.round(((index + 1) * sorted.length) / bands),
    );
    return { name, services: items, from: items[0].price, to: items[items.length - 1].price };
  });
}
