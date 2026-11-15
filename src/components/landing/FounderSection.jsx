import { FOUNDER, FOUNDER_STACK } from '../../content/founder';
import { techFor } from '../../content/techStack';
import Reveal from './Reveal';

function StackTile({ name, role }) {
  const tech = techFor(name);

  return (
    <li className="min-w-0">
      <a
        href={tech.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ '--brand': tech.color }}
        className="founder-stack__tile"
      >
        <span aria-hidden className="founder-stack__logo">
          <svg viewBox="0 0 24 24" className="size-[1.125rem]" fill="currentColor">
            <path d={tech.path} />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{tech.name}</span>
          <span className="block text-xs text-ink-dim">{role}</span>
        </span>
        <span className="sr-only"> (situs resmi, tab baru)</span>
      </a>
    </li>
  );
}

function FounderStack() {
  return (
    <div className="glass-inset p-4 sm:p-5">
      <h3 id="founder-stack-title" className="font-mono text-xs uppercase tracking-[0.18em] text-ink-dim">
        Tech stack
      </h3>
      <ul aria-labelledby="founder-stack-title" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FOUNDER_STACK.map((item) => (
          <StackTile key={item.name} {...item} />
        ))}
      </ul>
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
        sizes="(min-width: 640px) 30rem, 90vw"
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
            className="mt-4 max-w-xl text-balance font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl xl:max-w-none xl:text-[2.5rem] xl:leading-[1.1]"
          >
            {FOUNDER.heading}
          </h2>
        </Reveal>

        <Reveal delay={120} className="founder-grid__photo min-w-0">
          <Portrait />
        </Reveal>

        <div className="founder-grid__body flex min-w-0 flex-col">
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

          <Reveal delay={140} className="mt-8 xl:mt-auto xl:pt-6">
            <FounderStack />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
