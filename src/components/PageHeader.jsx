export default function PageHeader({ eyebrow, title, description, aside }) {
  return (
    <header className="animate__animated animate__fadeInUp animate__faster flex flex-wrap items-end justify-between gap-4 px-1">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{description}</p>
        )}
      </div>
      {aside}
    </header>
  );
}
