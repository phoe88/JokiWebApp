import { useId } from 'react';

const line = { stroke: 'rgba(255,255,255,0.45)', strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round' };

/** Drawn album covers, so the playlist needs no image files. */
const PATTERNS = {
  waves: () => (
    <>
      <path d="M-2 30 Q 8 22 18 30 T 38 30 T 58 30" {...line} />
      <path d="M-2 37 Q 8 29 18 37 T 38 37 T 58 37" {...line} opacity="0.6" />
      <circle cx="34" cy="14" r="5" fill="rgba(255,255,255,0.55)" />
    </>
  ),
  rain: () => (
    <>
      {[6, 14, 22, 30, 38, 10, 26, 42].map((x, i) => (
        <line key={i} x1={x} y1={i < 5 ? 6 : 22} x2={x - 4} y2={i < 5 ? 16 : 32} {...line} />
      ))}
      <rect x="6" y="36" width="36" height="5" rx="2.5" fill="rgba(255,255,255,0.35)" />
    </>
  ),
  sun: () => (
    <>
      <circle cx="24" cy="24" r="12" fill="rgba(255,255,255,0.7)" />
      {[25, 29, 33].map((y, i) => (
        <rect key={y} x="10" y={y} width="28" height={1.2 + i * 0.6} fill="currentColor" />
      ))}
      <line x1="0" y1="38" x2="48" y2="38" {...line} />
      <line x1="0" y1="43" x2="48" y2="43" {...line} opacity="0.6" />
    </>
  ),
  rings: () => (
    <>
      {[6, 11, 16, 21].map((r) => (
        <circle key={r} cx="24" cy="24" r={r} {...line} opacity={1 - r / 30} />
      ))}
    </>
  ),
  pixels: () => (
    <>
      {[
        [10, 10], [16, 10], [28, 10], [34, 10], [10, 16], [34, 16], [16, 28], [22, 28], [28, 28],
        [10, 22], [34, 22], [22, 16],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" fill="rgba(255,255,255,0.7)" />
      ))}
      <rect x="10" y="36" width="29" height="3" fill="rgba(255,255,255,0.35)" />
    </>
  ),
  grid: () => (
    <>
      {[30, 34, 39, 45].map((y) => (
        <line key={y} x1="0" y1={y} x2="48" y2={y} {...line} opacity="0.7" />
      ))}
      {[-24, -8, 8, 24].map((dx) => (
        <line key={dx} x1={24 + dx / 4} y1="26" x2={24 + dx * 1.6} y2="48" {...line} opacity="0.7" />
      ))}
      <circle cx="24" cy="15" r="7" fill="rgba(255,255,255,0.6)" />
    </>
  ),
};

export default function TrackArt({ art, playing = false, className = 'size-12' }) {
  const id = useId();
  const Pattern = PATTERNS[art.pattern] ?? PATTERNS.waves;

  return (
    <span aria-hidden className={`track-art ${className}`} style={{ color: art.to }}>
      <svg viewBox="0 0 48 48" className="size-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={art.from} />
            <stop offset="1" stopColor={art.to} />
          </linearGradient>
        </defs>
        <rect width="48" height="48" fill={`url(#${id})`} />
        <Pattern />
      </svg>
      {playing && (
        <span className="track-eq">
          <span />
          <span />
          <span />
        </span>
      )}
    </span>
  );
}
