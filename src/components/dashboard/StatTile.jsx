import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { isDemoMode } from '../../lib/SupabaseClient';
import Sparkline from '../charts/Sparkline';
import DemoTag from '../DemoTag';

/** A signed change against a named period. No change object means nothing to compare yet. */
function Delta({ change, format }) {
  if (!change) return null;

  const { change: amount, days } = change;
  const Icon = amount > 0 ? ArrowUpRight : amount < 0 ? ArrowDownRight : Minus;
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';

  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1 text-xs text-ink-muted">
      <Icon aria-hidden className="size-3.5 shrink-0" />
      <span className="figures font-semibold text-ink">
        {sign}
        {format(Math.abs(amount))}
      </span>
      <span>vs previous {days} days</span>
    </p>
  );
}

export default function StatTile({ icon: Icon, tone, label, value, format, hint, change, series, seriesLabel, index }) {
  const shown = useCountUp(value);

  return (
    <article
      style={{ animationDelay: `${index * 60}ms` }}
      className="glass lift animate__animated animate__fadeInUp animate__faster flex min-w-0 flex-col p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`icon-chip icon-chip--${tone}`}>
          <Icon aria-hidden className="size-4" />
        </span>
        {isDemoMode && <DemoTag>DEMO</DemoTag>}
      </div>

      <h2 className="mt-3 truncate text-sm font-medium text-ink-muted">{label}</h2>
      <p className="stat-value mt-0.5 truncate">{format(shown)}</p>
      {hint && <p className="mt-1 text-xs text-ink-dim">{hint}</p>}
      <Delta change={change} format={format} />

      <div className="mt-auto pt-3">
        <Sparkline values={series} tone={tone === 'live' ? 'live' : 'cyber'} label={seriesLabel} />
      </div>
    </article>
  );
}
