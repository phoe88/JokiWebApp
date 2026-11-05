/** Fixed width, so a chart can keep it inside its own box without measuring it. */
export const TIP_WIDTH = 188;

export default function ChartTooltip({ left, top, title, children }) {
  return (
    <div aria-hidden className="chart-tip" style={{ left, top, width: TIP_WIDTH }}>
      <p className="text-xs text-ink-dim">{title}</p>
      <div className="mt-1.5 flex flex-col gap-1">{children}</div>
    </div>
  );
}

/** Value first, then the name, keyed with a short stroke of the series colour. */
export function TooltipRow({ color, value, name }) {
  return (
    <p className="figures flex items-center gap-2 text-sm">
      {color && <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: color }} />}
      <span className="font-semibold text-ink">{value}</span>
      <span className="ml-auto text-xs text-ink-muted">{name}</span>
    </p>
  );
}
