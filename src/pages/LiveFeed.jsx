import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Pause, Play, Radio } from 'lucide-react';
import DemoNotice from '../components/DemoNotice';
import DemoTag from '../components/DemoTag';
import OrderProgress from '../components/OrderProgress';
import OrderStatusPill from '../components/OrderStatusPill';
import PageHeader from '../components/PageHeader';
import SignInGate from '../components/SignInGate';
import { ORDER_STATUS, ORDER_STEPS } from '../config/catalog';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { useReportConnection } from '../context/ConnectionContext';
import { createFeedSimulator } from '../data/demoOrders';
import { useMyOrders } from '../hooks/useMyOrders';
import { formatClock, shortId } from '../lib/format';
import { resolveOrders } from '../lib/orderMetrics';
import { isDemoMode } from '../lib/SupabaseClient';

const MAX_ENTRIES = 60;
const SIMULATION_INTERVAL_MS = 4500;
const FIRST_EVENT_DELAY_MS = 500;

function FeedEntry({ entry, simulated }) {
  return (
    <li className="relative pl-8">
      <span aria-hidden className="timeline__dot" style={{ '--dot': ORDER_STATUS[entry.to]?.dot ?? 'rgb(var(--ink-dim))' }} />
      <div className="glass-inset animate__animated animate__fadeInUp animate__faster p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="min-w-0 truncate text-sm font-semibold text-ink">{entry.title}</p>
          <time dateTime={new Date(entry.at).toISOString()} className="figures text-xs text-ink-dim">
            {formatClock(entry.at)}
          </time>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="figures mr-1 text-xs text-ink-dim">#{shortId(entry.orderId)}</span>
          {entry.from ? (
            <>
              <OrderStatusPill status={entry.from} />
              <ArrowRight aria-label="to" className="size-3.5 text-ink-dim" />
            </>
          ) : (
            <span className="text-xs text-ink-dim">{entry.isNew ? 'New' : 'Now'}</span>
          )}
          <OrderStatusPill status={entry.to} />
          {simulated && <DemoTag>SIMULATED</DemoTag>}
        </div>
      </div>
    </li>
  );
}

function FeedPanel({ title, entries, simulated, emptyText, state, controls }) {
  return (
    <section
      aria-label={title}
      className="glass animate__animated animate__fadeInUp animate__faster min-w-0 p-5 sm:p-6 lg:col-span-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title flex items-center gap-2.5">
          <span className="icon-chip icon-chip--live">
            <Radio aria-hidden className="size-4" />
          </span>
          Status stream
        </h2>
        <div className="flex items-center gap-2">
          <span className={`badge ${state.live ? 'badge--live' : 'badge--neutral'}`}>
            <span aria-hidden className={`live-dot ${state.live ? 'live-dot--pulse' : ''}`} />
            {state.label}
          </span>
          {controls}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="glass-inset mt-4 py-12 text-center text-sm text-ink-muted">{emptyText}</p>
      ) : (
        <ol role="log" aria-live="polite" className="timeline mt-4 flex max-h-[34rem] flex-col gap-2.5 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <FeedEntry key={entry.key} entry={entry} simulated={simulated} />
          ))}
        </ol>
      )}
    </section>
  );
}

function SidePanel({ title, children }) {
  return (
    <section
      aria-label={title}
      style={{ animationDelay: '80ms' }}
      className="glass animate__animated animate__fadeInUp animate__faster min-w-0 self-start p-5 sm:p-6 lg:col-span-4"
    >
      <h2 className="panel-title">{title}</h2>
      {children}
    </section>
  );
}

function useFeedEntries() {
  const [entries, setEntries] = useState([]);
  const nextKey = useRef(0);

  const addEntry = useCallback((entry) => {
    nextKey.current += 1;
    const keyed = { ...entry, key: nextKey.current, at: Date.now() };
    setEntries((current) => [keyed, ...current].slice(0, MAX_ENTRIES));
  }, []);

  return [entries, addEntry];
}

function SimulatedFeed() {
  const [entries, addEntry] = useFeedEntries();
  const [paused, setPaused] = useState(false);
  const stepRef = useRef(null);

  useEffect(() => {
    stepRef.current ??= createFeedSimulator();

    const emit = () => {
      const { orderId, service, from, to } = stepRef.current();
      addEntry({ orderId, title: service.title, from, to, isNew: !from });
    };

    if (paused) return undefined;
    const firstEvent = window.setTimeout(emit, FIRST_EVENT_DELAY_MS);
    const interval = window.setInterval(emit, SIMULATION_INTERVAL_MS);
    return () => {
      window.clearTimeout(firstEvent);
      window.clearInterval(interval);
    };
  }, [paused, addEntry]);

  return (
    <>
      <DemoNotice tag="SIMULATED">
        This feed is a simulation. Its orders are invented and no customers or purchases are behind
        them. With Supabase configured, this page streams your own orders.
      </DemoNotice>
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <FeedPanel
          title="Simulated status feed"
          entries={entries}
          simulated
          emptyText="Waiting for the next simulated event"
          state={paused ? { label: 'Paused', live: false } : { label: 'Simulating', live: true }}
          controls={
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              className="btn btn-ghost px-3 py-1.5 text-[13px]"
            >
              {paused ? <Play aria-hidden className="size-3.5" /> : <Pause aria-hidden className="size-3.5" />}
              {paused ? 'Resume' : 'Pause'}
            </button>
          }
        />
        <SidePanel title="This session">
          <ul className="mt-3 flex flex-col gap-2.5">
            {ORDER_STEPS.map((step) => (
              <li key={step} className="flex items-center justify-between gap-3">
                <OrderStatusPill status={step} />
                <span className="figures font-display text-lg font-bold text-ink">
                  {entries.filter(({ to }) => to === step).length}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-dim">
            <DemoTag>SIMULATED</DemoTag>
            Events shown since you opened this page.
          </p>
        </SidePanel>
      </div>
    </>
  );
}

function OwnOrdersFeed() {
  const [entries, addEntry] = useFeedEntries();
  const { services } = useCatalog();

  const onEvent = useCallback(
    ({ order, from, to, isNew }) => {
      // Rows straight off the channel have no joined service, only its id.
      const title =
        order.service?.title ?? services.find(({ id }) => id === order.service_id)?.title ?? 'Service';
      addEntry({ orderId: order.id, title, from, to, isNew });
    },
    [addEntry, services],
  );

  const { orders, loading, error, connection } = useMyOrders({ onEvent });
  const resolved = useMemo(() => resolveOrders(orders, services), [orders, services]);
  const linked = connection === 'SUBSCRIBED';

  useReportConnection(connection);

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-12">
      <FeedPanel
        title="Your order status stream"
        entries={entries}
        emptyText="Listening for changes to your orders"
        state={linked ? { label: 'Live', live: true } : { label: 'Not linked', live: false }}
      />
      <SidePanel title="Current status">
        {error && <p className="mt-3 text-sm text-danger">{error.message}</p>}
        {!error && !loading && resolved.length === 0 && (
          <p className="mt-3 text-sm text-ink-muted">You have no orders yet.</p>
        )}
        <ul className="mt-3 flex flex-col gap-3">
          {resolved.slice(0, 6).map((order) => (
            <li key={order.id} className="glass-inset min-w-0 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium text-ink">{order.service?.title ?? 'Service'}</p>
                <OrderStatusPill status={order.status} />
              </div>
              <OrderProgress status={order.status} className="mt-2.5" />
            </li>
          ))}
        </ul>
      </SidePanel>
    </div>
  );
}

export default function LiveFeed() {
  const { user, loading } = useAuth();

  return (
    <div className="pt-6">
      <PageHeader
        eyebrow="Status stream"
        title="Live Feed"
        description="A running log of status changes on your orders while this page is open."
      />
      {isDemoMode ? (
        <SimulatedFeed />
      ) : user ? (
        <OwnOrdersFeed />
      ) : loading ? (
        <p className="mt-6 px-1 text-sm text-ink-dim">Checking session</p>
      ) : (
        <SignInGate body="The feed only shows your own orders, so sign in to open it." />
      )}
    </div>
  );
}
