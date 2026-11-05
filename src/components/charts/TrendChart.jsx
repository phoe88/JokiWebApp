import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useElementSize } from '../../hooks/useElementSize';
import { areaPath, clamp, linePath, niceScale } from '../../lib/chartGeometry';
import { formatDayMonth, formatIDR, formatIDRCompact } from '../../lib/format';
import { addDays } from '../../lib/orderMetrics';
import ChartTooltip, { TIP_WIDTH, TooltipRow } from './ChartTooltip';

const HEIGHT = 300;
const PLOT = { top: 14, right: 10, bottom: 30, left: 68 };
const LABEL_GAP = 78;
const POINTER_GAP = 14;

const PLACED = 'var(--series-placed)';
const COMPLETED = 'var(--series-completed)';

const periodLabel = ({ start, end }) =>
  `${formatDayMonth(start)} to ${formatDayMonth(addDays(end, -1))}`;

const orderCount = (count) => `${count} ${count === 1 ? 'order' : 'orders'}`;

/** Labels at one even stride, counted back from today so the newest period is always named. */
function labelIndexes(count, plotWidth) {
  const slots = Math.max(2, Math.floor(plotWidth / LABEL_GAP));
  const stride = Math.ceil((count - 1) / (slots - 1));
  const picks = [];
  for (let index = count - 1; index >= 0; index -= stride) picks.push(index);
  return picks;
}

function describe(buckets) {
  const peak = buckets.reduce((best, bucket) => (bucket.placed > best.placed ? bucket : best));
  const total = buckets.reduce((sum, bucket) => sum + bucket.placed, 0);
  return `Area chart of estimated order value per period. ${formatIDR(total)} placed in total, peaking at ${formatIDR(peak.placed)} from ${periodLabel(peak)}. The orders table below lists every order.`;
}

export default function TrendChart({ trend }) {
  const { buckets } = trend;
  const count = buckets.length;
  const [sizeRef, { width }] = useElementSize();
  const [active, setActive] = useState(null);
  const rootRef = useRef(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const scale = useMemo(() => niceScale(Math.max(...buckets.map(({ placed }) => placed))), [buckets]);

  const plotWidth = Math.max(width - PLOT.left - PLOT.right, 1);
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;
  const baseline = PLOT.top + plotHeight;

  const xAt = (index) => PLOT.left + (index * plotWidth) / (count - 1);
  const yAt = (value) => PLOT.top + plotHeight * (1 - value / scale.max);

  const placedPoints = buckets.map(({ placed }, index) => ({ x: xAt(index), y: yAt(placed) }));
  const completedPoints = buckets.map(({ completed }, index) => ({ x: xAt(index), y: yAt(completed) }));

  // A live update can shorten the All range underneath an open tooltip.
  const index = active === null ? null : Math.min(active, count - 1);
  const bucket = index === null ? null : buckets[index];

  // A touch has no pointerleave to close the tooltip, so a tap anywhere else does.
  useEffect(() => {
    if (active === null) return undefined;
    const dismiss = (event) => {
      if (!rootRef.current?.contains(event.target)) setActive(null);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [active]);

  const pick = (event) => {
    const { left } = event.currentTarget.getBoundingClientRect();
    const offset = event.clientX - left - PLOT.left;
    setActive(Math.max(0, Math.min(count - 1, Math.round((offset / plotWidth) * (count - 1)))));
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      setActive(null);
      return;
    }
    const from = index ?? count - 1;
    const target = {
      ArrowLeft: from - 1,
      ArrowDown: from - 1,
      ArrowRight: from + 1,
      ArrowUp: from + 1,
      Home: 0,
      End: count - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    setActive(Math.max(0, Math.min(count - 1, target)));
  };

  const crosshairX = index === null ? 0 : xAt(index);
  const rightSide = crosshairX + POINTER_GAP;
  const tipLeft = clamp(
    rightSide + TIP_WIDTH <= width ? rightSide : crosshairX - POINTER_GAP - TIP_WIDTH,
    TIP_WIDTH,
    0,
    width,
  );

  const reading = bucket ?? buckets[count - 1];

  return (
    <div ref={rootRef} className="relative mt-4">
      <div ref={sizeRef} style={{ height: HEIGHT }}>
        {width > 0 && (
          <svg role="img" aria-label={describe(buckets)} width={width} height={HEIGHT} className="block overflow-visible">
            <defs>
              <linearGradient id={`${uid}-placed`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PLACED} stopOpacity="0.34" />
                <stop offset="100%" stopColor={PLACED} stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`${uid}-completed`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COMPLETED} stopOpacity="0.26" />
                <stop offset="100%" stopColor={COMPLETED} stopOpacity="0" />
              </linearGradient>
              <clipPath id={`${uid}-reveal`}>
                <rect className="chart-reveal" x="0" y="0" width={width} height={HEIGHT} />
              </clipPath>
            </defs>

            {scale.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PLOT.left}
                  x2={width - PLOT.right}
                  y1={yAt(tick)}
                  y2={yAt(tick)}
                  stroke={tick === 0 ? 'var(--chart-axis)' : 'var(--chart-grid)'}
                />
                <text
                  x={PLOT.left - 10}
                  y={yAt(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  className="figures fill-ink-dim text-[11px]"
                >
                  {formatIDRCompact(tick)}
                </text>
              </g>
            ))}

            {labelIndexes(count, plotWidth).map((labelIndex) => (
              <text
                key={labelIndex}
                x={xAt(labelIndex)}
                y={HEIGHT - 8}
                textAnchor={labelIndex === 0 ? 'start' : labelIndex === count - 1 ? 'end' : 'middle'}
                className="figures fill-ink-dim text-[11px]"
              >
                {formatDayMonth(addDays(buckets[labelIndex].end, -1))}
              </text>
            ))}

            <g clipPath={`url(#${uid}-reveal)`}>
              <path d={areaPath(placedPoints, baseline)} fill={`url(#${uid}-placed)`} />
              <path d={areaPath(completedPoints, baseline)} fill={`url(#${uid}-completed)`} />
              <path
                d={linePath(placedPoints)}
                fill="none"
                stroke={PLACED}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={linePath(completedPoints)}
                fill="none"
                stroke={COMPLETED}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {bucket && (
              <g>
                <line x1={crosshairX} x2={crosshairX} y1={PLOT.top} y2={baseline} stroke="rgb(var(--ink-muted) / 0.55)" />
                <circle cx={crosshairX} cy={yAt(bucket.placed)} r="5" fill={PLACED} stroke="var(--chart-surface)" strokeWidth="2" />
                <circle cx={crosshairX} cy={yAt(bucket.completed)} r="5" fill={COMPLETED} stroke="var(--chart-surface)" strokeWidth="2" />
              </g>
            )}
          </svg>
        )}
      </div>

      {width > 0 && (
        <div
          role="slider"
          tabIndex={0}
          aria-label="Read the order value of each period with the arrow keys"
          aria-valuemin={0}
          aria-valuemax={count - 1}
          aria-valuenow={index ?? count - 1}
          aria-valuetext={`${periodLabel(reading)}: ${formatIDR(reading.placed)} placed, ${formatIDR(reading.completed)} of it completed, ${orderCount(reading.count)}`}
          onPointerDown={pick}
          onPointerMove={pick}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') setActive(null);
          }}
          onFocus={() => setActive((current) => current ?? count - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={onKeyDown}
          className="chart-hit"
        />
      )}

      {bucket && (
        <ChartTooltip left={tipLeft} top={PLOT.top} title={periodLabel(bucket)}>
          <TooltipRow color={PLACED} value={formatIDRCompact(bucket.placed)} name="Placed" />
          <TooltipRow color={COMPLETED} value={formatIDRCompact(bucket.completed)} name="Completed" />
          <p className="text-xs text-ink-dim">{orderCount(bucket.count)}</p>
        </ChartTooltip>
      )}
    </div>
  );
}
