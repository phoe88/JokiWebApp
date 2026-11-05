import { useState } from 'react';
import { categoryIcon } from '../../config/catalog';
import { useElementSize } from '../../hooks/useElementSize';
import { clamp, horizontalBarPath } from '../../lib/chartGeometry';
import { formatIDR, formatIDRCompact, formatPercent } from '../../lib/format';
import ChartTooltip, { TIP_WIDTH, TooltipRow } from './ChartTooltip';

const BAR_HEIGHT = 12;

/** Ranked bars: the largest category carries the colour and the rest stay quiet. */
export default function CategoryBars({ categories }) {
  const [sizeRef, { width }] = useElementSize();
  const [active, setActive] = useState(null);
  const largest = categories[0]?.value || 1;

  return (
    <ol ref={sizeRef} className="mt-4 flex flex-1 flex-col justify-between gap-3.5">
      {categories.map((category, index) => {
        const Icon = categoryIcon(category.name);
        const length = (category.value / largest) * width;
        const highlighted = index === 0;

        return (
          <li
            key={category.name}
            tabIndex={0}
            aria-label={`${category.name}: ${formatIDR(category.value)}, ${formatPercent(category.share)} of estimated value, ${category.count} ${category.count === 1 ? 'order' : 'orders'}`}
            onPointerEnter={() => setActive(category.name)}
            onPointerDown={() => setActive(category.name)}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') setActive(null);
            }}
            onFocus={() => setActive(category.name)}
            onBlur={() => setActive(null)}
            className="bar-row"
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-ink-muted">
                <Icon aria-hidden className="size-4 shrink-0 text-ink-dim" />
                <span className="truncate">{category.name}</span>
              </span>
              <span className="figures shrink-0 font-semibold text-ink">{formatIDRCompact(category.value)}</span>
            </div>

            {width > 0 && (
              <svg aria-hidden width={width} height={BAR_HEIGHT} className="mt-1.5 block">
                <rect width={width} height={BAR_HEIGHT} rx={BAR_HEIGHT / 2} fill="rgba(255, 255, 255, 0.05)" />
                {length > 0 && (
                  <path
                    d={horizontalBarPath(length, BAR_HEIGHT, 4)}
                    className="bar-grow"
                    style={{
                      animationDelay: `${index * 70}ms`,
                      filter: highlighted ? 'drop-shadow(0 0 7px rgb(10 165 192 / 0.6))' : undefined,
                    }}
                    fill={highlighted ? 'var(--series-placed)' : 'rgb(var(--ink-dim) / 0.42)'}
                  />
                )}
              </svg>
            )}

            {active === category.name && (
              <ChartTooltip
                left={clamp(length - TIP_WIDTH / 2, TIP_WIDTH, 0, width)}
                top="calc(100% + 6px)"
                title={category.name}
              >
                <TooltipRow value={formatIDRCompact(category.value)} name="Estimated" />
                <TooltipRow value={formatPercent(category.share)} name="Of total" />
                <TooltipRow value={category.count} name={category.count === 1 ? 'Order' : 'Orders'} />
              </ChartTooltip>
            )}
          </li>
        );
      })}
    </ol>
  );
}
