import { useState } from 'react';
import { categoryIcon } from '../../config/catalog';
import { formatAgo, formatFullDate, formatIDR, shortId } from '../../lib/format';
import { isDemoMode } from '../../lib/SupabaseClient';
import DemoTag from '../DemoTag';
import OrderProgress from '../OrderProgress';
import OrderStatusPill from '../OrderStatusPill';

const FIRST_PAGE = 6;

const priceText = (order) => (order.value === null ? '-' : formatIDR(order.value));

function ServiceIcon({ order }) {
  const Icon = categoryIcon(order.service?.category);
  return (
    <span className="icon-chip icon-chip--neutral size-9">
      <Icon aria-hidden className="size-4" />
    </span>
  );
}

function OrdersTable({ orders }) {
  return (
    <table className="mt-3 hidden w-full table-fixed border-separate border-spacing-0 text-sm md:table">
      <caption className="sr-only">Your orders, newest first, with estimated value at current prices</caption>
      <thead>
        <tr className="text-left text-xs text-ink-dim">
          <th scope="col" className="py-2 pr-4 font-medium">Order</th>
          <th scope="col" className="w-28 py-2 pr-4 font-medium">Placed</th>
          <th scope="col" className="w-28 py-2 pr-4 text-right font-medium">Est. value</th>
          <th scope="col" className="w-32 py-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id} className="hover:bg-white/[0.03]">
            <td className="border-t border-white/[0.06] py-2.5 pr-4">
              <div className="flex min-w-0 items-center gap-3">
                <ServiceIcon order={order} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{order.service?.title ?? 'Service'}</p>
                  <p className="figures text-xs text-ink-dim">#{shortId(order.id)}</p>
                </div>
              </div>
            </td>
            <td className="figures whitespace-nowrap border-t border-white/[0.06] py-2.5 pr-4 text-ink-muted">
              {formatFullDate(order.created_at)}
            </td>
            <td className="figures whitespace-nowrap border-t border-white/[0.06] py-2.5 pr-4 text-right font-semibold text-ink">
              {priceText(order)}
            </td>
            <td className="border-t border-white/[0.06] py-2.5">
              <OrderStatusPill status={order.status} />
              <OrderProgress status={order.status} className="mt-2" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OrdersList({ orders }) {
  return (
    <ul className="mt-3 flex flex-col gap-2.5 md:hidden">
      {orders.map((order) => (
        <li key={order.id} className="glass-inset p-3">
          <div className="flex min-w-0 items-center gap-3">
            <ServiceIcon order={order} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{order.service?.title ?? 'Service'}</p>
              <p className="figures truncate text-xs text-ink-dim">
                #{shortId(order.id)} · {formatAgo(order.created_at)}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <OrderStatusPill status={order.status} />
            <span className="figures text-sm font-semibold text-ink">{priceText(order)}</span>
          </div>
          <OrderProgress status={order.status} className="mt-2.5" />
        </li>
      ))}
    </ul>
  );
}

/** Doubles as the table view of the charts above, so every order can be reached from here. */
export default function OrdersPanel({ orders, className = '' }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? orders : orders.slice(0, FIRST_PAGE);

  return (
    <section
      aria-labelledby="orders-title"
      style={{ animationDelay: '300ms' }}
      className={`glass animate__animated animate__fadeInUp animate__faster min-w-0 p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="orders-title" className="panel-title flex items-center gap-2">
          Recent orders
          {isDemoMode && <DemoTag>DEMO</DemoTag>}
        </h2>
        <p className="figures shrink-0 text-sm text-ink-dim">
          {shown.length} of {orders.length}
        </p>
      </div>

      <OrdersTable orders={shown} />
      <OrdersList orders={shown} />

      {orders.length > FIRST_PAGE && (
        <button type="button" onClick={() => setExpanded((value) => !value)} className="btn btn-ghost mt-4 w-full sm:w-auto">
          {expanded ? 'Show fewer' : `Show all ${orders.length} orders`}
        </button>
      )}
    </section>
  );
}
