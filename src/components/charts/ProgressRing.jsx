import { useId } from 'react';
import { useCountUp } from '../../hooks/useCountUp';

const SIZE = 168;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A glowing ring for one share. The figure in the middle is the number, the ring its shape. */
export default function ProgressRing({ share, label, caption }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const shown = useCountUp(share * 100);
  const centre = SIZE / 2;

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg role="img" aria-label={label} viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} className="block overflow-visible">
        <defs>
          <linearGradient id={`${uid}-arc`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(var(--live))" />
            <stop offset="100%" stopColor="rgb(var(--live-deep))" />
          </linearGradient>
        </defs>
        <circle cx={centre} cy={centre} r={RADIUS} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth={STROKE} />
        {share > 0 && (
          <g className="ring-arc">
            <circle
              cx={centre}
              cy={centre}
              r={RADIUS}
              fill="none"
              stroke={`url(#${uid}-arc)`}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE * share} ${CIRCUMFERENCE}`}
              transform={`rotate(-90 ${centre} ${centre})`}
              style={{ filter: 'drop-shadow(0 0 9px rgb(var(--live) / 0.55))' }}
            />
          </g>
        )}
      </svg>
      <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-4xl font-bold tracking-tight text-ink">{Math.round(shown)}%</span>
        <span className="mt-0.5 text-xs text-ink-muted">{caption}</span>
      </div>
    </div>
  );
}
