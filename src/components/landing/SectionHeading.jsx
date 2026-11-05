import Reveal from './Reveal';

export default function SectionHeading({ tag, title, body, className = '' }) {
  return (
    <Reveal className={`max-w-2xl ${className}`}>
      <p className="code-tag">{`// ${tag}`}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {body && <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">{body}</p>}
    </Reveal>
  );
}
