const TONES = {
  default: 'icon-chip--cyber',
  error: 'icon-chip--danger',
  warn: 'icon-chip--cyber',
};

/** Centered glass panel for empty, error and signed-out states. */
export default function Notice({ icon: Icon, title, body, action, tone = 'default' }) {
  return (
    <div className="glass animate__animated animate__fadeInUp animate__faster mt-5 flex flex-col items-center px-6 py-14 text-center">
      <span className={`icon-chip size-14 rounded-2xl ${TONES[tone]}`}>
        <Icon aria-hidden className="size-6" strokeWidth={1.75} />
      </span>
      <h2 className="mt-5 font-display text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{body}</p>
      {action}
    </div>
  );
}
