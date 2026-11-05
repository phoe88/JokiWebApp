import { categoryIcon } from '../config/catalog';
import { formatCount, formatIDR } from '../lib/format';
import { isDemoMode } from '../lib/SupabaseClient';
import DemoTag from './DemoTag';
import OrderButton from './OrderButton';
import ServiceCover from './ServiceCover';
import StatusBadge from './StatusBadge';

function CardMeta({ service }) {
  const CategoryIcon = categoryIcon(service.category);

  return (
    <div className="flex items-center justify-between gap-3">
      <StatusBadge status={service.status} />
      <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink-muted">
        <CategoryIcon aria-hidden className="size-3.5 shrink-0" />
        <span className="truncate">{service.category}</span>
      </span>
    </div>
  );
}

function CardFigures({ service, completed }) {
  return (
    <dl className="grid grid-cols-2 gap-3">
      <div>
        <dt className="text-xs text-ink-dim">Price</dt>
        <dd className="figures mt-0.5 font-display text-[17px] font-bold text-ink">{formatIDR(service.price)}</dd>
      </div>
      <div>
        <dt className="text-xs text-ink-dim">Completed</dt>
        <dd className="figures mt-0.5 flex items-center gap-2 font-display text-[17px] font-bold text-ink">
          {completed === null ? <span title="Counter unavailable">-</span> : formatCount(completed)}
          {isDemoMode && <DemoTag>DEMO</DemoTag>}
        </dd>
      </div>
    </dl>
  );
}

/** `layout` comes from catalogLayout: the cells this card spans and which shape it takes. */
export default function ServiceCard({ service, completed, busy, onOrder, index, layout }) {
  const { cols, rows, variant } = layout;
  const featured = variant === 'featured';
  const sideways = variant === 'wide' && cols > 1;

  const frame = {
    gridColumn: `span ${cols} / span ${cols}`,
    gridRow: `span ${rows} / span ${rows}`,
    animationDelay: `${Math.min(index, 8) * 45}ms`,
  };
  const shell = 'glass lift group animate__animated animate__fadeInUp animate__faster flex min-w-0 flex-col p-2';

  if (featured) {
    return (
      <article style={frame} className={`${shell} gap-1`}>
        <ServiceCover service={service} large className="min-h-[20rem] flex-1 p-5 sm:p-6">
          <CardMeta service={service} />
          <h3 className="mt-6 max-w-lg font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            {service.title}
          </h3>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">{service.description}</p>
        </ServiceCover>

        <div className="grid items-center gap-4 p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <CardFigures service={service} completed={completed} />
          <OrderButton service={service} busy={busy} onOrder={onOrder} primary className="w-full px-6 sm:w-auto" />
        </div>
      </article>
    );
  }

  return (
    <article style={frame} className={`${shell} gap-1 ${sideways ? 'sm:flex-row sm:gap-2' : ''}`}>
      <ServiceCover
        service={service}
        large={sideways}
        className={sideways ? 'h-28 shrink-0 sm:h-auto sm:w-2/5' : 'h-28 shrink-0'}
      />

      <div className="flex min-w-0 flex-1 flex-col p-3">
        <CardMeta service={service} />
        <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-ink">{service.title}</h3>
        <p className="mb-4 mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">{service.description}</p>
        <CardFigures service={service} completed={completed} />
        <OrderButton service={service} busy={busy} onOrder={onOrder} className="mt-4 w-full" />
      </div>
    </article>
  );
}
