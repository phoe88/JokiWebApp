import { FOUNDER, FOUNDER_STACK } from '../../content/founder';
import { techFor } from '../../content/techStack';
import Reveal from './Reveal';

function StackRow({ name, note }) {
  const tech = techFor(name);

  return (
    <li className="founder-stack__row">
      {tech && (
        <span aria-hidden style={{ '--brand': tech.color }} className="founder-stack__logo">
          <svg viewBox="0 0 24 24" className="size-[1.125rem]" fill="currentColor">
            <path d={tech.path} />
          </svg>
        </span>
      )}
      <div className="min-w-0">
        <h4 className="text-[15px] font-semibold text-ink">
          {tech ? (
            <a href={tech.url} target="_blank" rel="noopener noreferrer" className="founder-stack__link">
              {name}
              <span className="sr-only"> (situs resmi, tab baru)</span>
            </a>
          ) : (
            name
          )}
        </h4>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{note}</p>
      </div>
    </li>
  );
}

function FounderStack() {
  return (
    <div className="glass-inset p-5 sm:p-6">
      <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-dim">Tech stack</h3>
      <div className="mt-4 flex flex-col gap-5">
        {FOUNDER_STACK.map(({ group, items }) => (
          <section key={group} aria-label={group}>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{group}</p>
            <ul className="mt-2.5 flex flex-col gap-2">
              {items.map((item) => (
                <StackRow key={item.name} {...item} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Portrait() {
  const { src, srcSet, width, height, alt } = FOUNDER.portrait;

  return (
    <figure className="founder-portrait">
      <div aria-hidden className="founder-portrait__grid" />
      <img
        src={src}
        srcSet={srcSet}
        sizes="(min-width: 1024px) 30rem, (min-width: 640px) 26rem, 90vw"
        width={width}
        height={height}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="founder-portrait__img"
      />
      <figcaption className="founder-portrait__tag">
        <span className="font-display text-base font-bold text-ink">{FOUNDER.name}</span>
        <span className="text-[13px] text-ink-muted">CEO &amp; Founder</span>
      </figcaption>
    </figure>
  );
}

export default function FounderSection() {
  return (
    <section id="founder" aria-labelledby="founder-title" className="page-shell scroll-mt-28 py-20 lg:py-24">
      <div className="founder-grid">
        <Reveal className="founder-grid__head min-w-0">
          <p className="founder-label">
            <span aria-hidden className="founder-label__dot" />
            {FOUNDER.label}
          </p>
          <h2
            id="founder-title"
            className="mt-4 max-w-xl text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
          >
            {FOUNDER.heading}
          </h2>
        </Reveal>

        <Reveal delay={120} className="founder-grid__photo min-w-0">
          <Portrait />
        </Reveal>

        <div className="founder-grid__body min-w-0">
          <Reveal delay={60}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div>
                <p className="font-display text-2xl font-bold tracking-tight text-ink">{FOUNDER.name}</p>
                <p className="text-[15px] text-ink-muted">{FOUNDER.role}</p>
              </div>
              <span className="badge badge--neutral whitespace-normal">{FOUNDER.identity}</span>
            </div>

            <blockquote className="founder-bio">
              {FOUNDER.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </blockquote>
          </Reveal>

          <Reveal delay={140} className="mt-8">
            <FounderStack />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
