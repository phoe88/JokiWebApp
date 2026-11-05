const STATES = {
  SUBSCRIBED: { label: 'Realtime linked', className: 'badge--live', pulse: true },
  CONNECTING: { label: 'Linking', className: 'badge--cyber' },
};

const OFFLINE = { label: 'Realtime offline', className: 'badge--cyber' };

/** Below sm only the dot shows, and the label stays for screen readers. */
export default function ConnectionBadge({ connection }) {
  const { label, className, pulse } = STATES[connection] ?? OFFLINE;
  return (
    <span role="status" title={label} className={`badge ${className}`}>
      <span aria-hidden className={`live-dot ${pulse ? 'live-dot--pulse' : ''}`} />
      <span className="sr-only sm:not-sr-only">{label}</span>
    </span>
  );
}
