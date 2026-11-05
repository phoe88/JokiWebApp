import { ORDER_STATUS, ORDER_STEPS } from '../../config/catalog';
import { formatAgo, formatPercent } from '../../lib/format';
import { isDemoMode } from '../../lib/SupabaseClient';
import ProgressRing from '../charts/ProgressRing';
import DemoTag from '../DemoTag';
import OrderProgress from '../OrderProgress';
import OrderStatusPill from '../OrderStatusPill';

function StatusCounts({ summary }) {
  const counts = { pending: summary.pending, in_progress: summary.inProgress, completed: summary.completed };

  return (
    <ul className="flex flex-1 flex-col gap-2">
      {ORDER_STEPS.map((step) => {
        const { label, icon: Icon } = ORDER_STATUS[step];
        return (
          <li key={step} className="flex items-center gap-2 text-sm text-ink-muted">
            <Icon aria-hidden className="size-4 shrink-0 text-ink-dim" />
            {label}
            <span className="figures ml-auto font-semibold text-ink">{counts[step]}</span>
          </li>
        );
      })}
    </ul>
  );
}

function FocusOrder({ order }) {
  return (
    <div className="glass-inset mt-4 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-ink-dim">Worth watching</p>
        <OrderStatusPill status={order.status} />
      </div>
      <p className="mt-1.5 truncate text-sm font-semibold text-ink">{order.service?.title ?? 'Service'}</p>
      <p className="text-xs text-ink-dim">Placed {formatAgo(order.created_at)}</p>
      <OrderProgress status={order.status} className="mt-2.5" />
    </div>
  );
}

export default function CompletionPanel({ summary, focus, className = '' }) {
  return (
    <section
      aria-labelledby="completion-title"
      style={{ animationDelay: '180ms' }}
      className={`glass animate__animated animate__fadeInUp animate__faster flex min-w-0 flex-col p-5 sm:p-6 ${className}`}
    >
      <h2 id="completion-title" className="panel-title flex items-center gap-2">
        Completion
        {isDemoMode && <DemoTag>DEMO</DemoTag>}
      </h2>

      <div className="mt-4 flex flex-1 flex-col justify-center gap-5 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
        <ProgressRing
          share={summary.completionShare}
          label={`${formatPercent(summary.completionShare)} of orders completed: ${summary.completed} of ${summary.count}`}
          caption={`${summary.completed} of ${summary.count} orders`}
        />
        <StatusCounts summary={summary} />
      </div>

      {focus && <FocusOrder order={focus} />}
    </section>
  );
}
