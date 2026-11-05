import { useMemo, useState } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatIDRCompact } from '../../lib/format';
import { buildTrend, DEFAULT_RANGE, RANGES } from '../../lib/orderMetrics';
import { isDemoMode } from '../../lib/SupabaseClient';
import TrendChart from '../charts/TrendChart';
import DemoTag from '../DemoTag';

function LegendKey({ color, children }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-muted">
      <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: color }} />
      {children}
    </span>
  );
}

function PeriodChange({ trend }) {
  if (!trend.previous) return null;

  const difference = trend.totals.placed - trend.previous.placed;
  const sign = difference > 0 ? '+' : difference < 0 ? '-' : '';
  return (
    <p className="text-sm text-ink-muted">
      <span className="figures font-semibold text-ink">
        {sign}
        {formatIDRCompact(Math.abs(difference))}
      </span>{' '}
      vs the period before
    </p>
  );
}

/** The chart needs two periods with orders in them. Anything less isn't a trend. */
function SparseTrend({ trend }) {
  return (
    <p className="glass-inset mt-4 px-4 py-12 text-center text-sm leading-relaxed text-ink-muted">
      {trend.totals.count === 0
        ? `No orders were placed in ${trend.range.name}.`
        : `All of these orders fall in a single period, so there is no trend to draw yet. It appears once orders land in a second period.`}
    </p>
  );
}

export default function TrendPanel({ orders, className = '' }) {
  const [rangeId, setRangeId] = useState(DEFAULT_RANGE);
  const trend = useMemo(() => buildTrend(orders, rangeId), [orders, rangeId]);
  const shown = useCountUp(trend.totals.placed);
  const activePeriods = trend.buckets.filter(({ count }) => count > 0).length;

  return (
    <section
      aria-labelledby="trend-title"
      style={{ animationDelay: '120ms' }}
      className={`glass animate__animated animate__fadeInUp animate__faster min-w-0 p-5 sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h2 id="trend-title" className="panel-title flex items-center gap-2">
            Order value
            {isDemoMode && <DemoTag>DEMO</DemoTag>}
          </h2>
          <p className="hero-figure mt-2">{formatIDRCompact(shown)}</p>
          <p className="mt-1 text-sm text-ink-dim">
            Placed in {trend.range.name}, estimated at current prices
          </p>
          <PeriodChange trend={trend} />
        </div>

        <div role="group" aria-label="Chart range" className="segment">
          {RANGES.map(({ id, label, name }) => (
            <button
              key={id}
              type="button"
              aria-pressed={rangeId === id}
              aria-label={`Show ${name}`}
              onClick={() => setRangeId(id)}
              className="pill"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activePeriods >= 2 ? (
        <>
          <TrendChart key={rangeId} trend={trend} />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <LegendKey color="var(--series-placed)">Placed</LegendKey>
            <LegendKey color="var(--series-completed)">Completed so far</LegendKey>
          </div>
        </>
      ) : (
        <SparseTrend trend={trend} />
      )}
    </section>
  );
}
