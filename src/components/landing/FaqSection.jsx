import { useId, useState } from 'react';
import { ChevronDown, MessagesSquare } from 'lucide-react';
import { FAQS } from '../../content/landing';
import Reveal from './Reveal';
import ScrambleText from './ScrambleText';

function FaqItem({ question, answer, open, onToggle }) {
  const id = useId();

  return (
    <div className="glass-soft rounded-2xl">
      <h3>
        <button
          type="button"
          id={`${id}-button`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left font-display text-[17px] font-semibold text-ink"
        >
          {question}
          <ChevronDown aria-hidden className="faq-chevron size-5 shrink-0 text-live" />
        </button>
      </h3>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-button`} data-open={open} className="faq-panel">
        <div>
          <p className="px-5 pb-5 text-[15px] leading-relaxed text-ink-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection({ onConsult }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" aria-labelledby="faq-title" className="page-shell scroll-mt-28 py-20 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
        <Reveal className="min-w-0">
          <h2 id="faq-title" className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Yang sering ditanyakan
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
            Belum ketemu jawabannya? Ceritakan project kamu dan kita bahas bareng.
          </p>
          <button type="button" onClick={onConsult} className="btn btn-ghost glitch-host mt-6">
            <MessagesSquare aria-hidden className="size-4" />
            <ScrambleText text="Konsultasi Sekarang" />
          </button>
        </Reveal>

        <Reveal delay={80} className="flex min-w-0 flex-col gap-3">
          {FAQS.map(({ question, answer }, index) => (
            <FaqItem
              key={question}
              question={question}
              answer={answer}
              open={openIndex === index}
              onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
