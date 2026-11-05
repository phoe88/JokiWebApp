import { useId } from 'react';
import { useElementSize } from '../../hooks/useElementSize';
import { areaPath, linePath } from '../../lib/chartGeometry';

const HEIGHT = 44;
const INSET = 5;

const SERIES = {
  cyber: 'var(--series-placed)',
  live: 'var(--series-completed)',
};

/** One stat tile's trend. Fewer than two active weeks is no trend, so it says so instead. */
export default function Sparkline({ values, tone = 'cyber', label }) {
  const [sizeRef, { width }] = useElementSize();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const enoughData = values.filter((value) => value > 0).length >= 2;
  const color = SERIES[tone];

  if (!enoughData) {
    return <p className="flex h-11 items-end text-xs text-ink-dim">Not enough history for a trend</p>;
  }

  const top = Math.max(...values);
  const points = values.map((value, index) => ({
    x: INSET + (index * (width - INSET * 2)) / (values.length - 1),
    y: HEIGHT - INSET - (value / top) * (HEIGHT - INSET * 2),
  }));
  const last = points[points.length - 1];

  return (
    <div ref={sizeRef} className="h-11 w-full">
      {width > 0 && (
        <svg role="img" aria-label={label} width={width} height={HEIGHT} className="block">
          <defs>
            <linearGradient id={`${uid}-wash`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <clipPath id={`${uid}-reveal`}>
              <rect className="chart-reveal" x="0" y="0" width={width} height={HEIGHT} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid}-reveal)`}>
            <path d={areaPath(points, HEIGHT)} fill={`url(#${uid}-wash)`} />
            <path d={linePath(points)} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={last.x} cy={last.y} r="4" fill={color} stroke="var(--chart-surface)" strokeWidth="2" />
          </g>
        </svg>
      )}
    </div>
  );
}
