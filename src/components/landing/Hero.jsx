import { ArrowRight, MessagesSquare } from 'lucide-react';
import { HERO_STACK } from '../../content/techStack';
import CodeWindow from './CodeWindow';
import ScrambleText from './ScrambleText';
import TechLogos from './TechLogos';

export default function Hero({ onConsult }) {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate">
      <div aria-hidden className="grid-backdrop" />
      <div className="page-shell grid items-center gap-12 pb-20 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14 lg:pb-28 lg:pt-24">
        <div className="animate__animated animate__fadeInUp animate__faster min-w-0">
          <p className="code-tag inline-flex items-center gap-2 rounded-full border border-live/25 bg-live/10 px-3 py-1">
            <span aria-hidden className="live-dot live-dot--pulse" />
            Web development dan joki project
          </p>

          <h1
            id="hero-heading"
            className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.06] tracking-tight text-ink [text-wrap:balance] sm:text-6xl xl:text-[4.25rem]"
          >
            Web custom yang <span className="text-accent-gradient">cepat jadi</span> dan bisa diandalkan.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            JokiWebApp mengerjakan website, aplikasi web, dan project kamu dengan kode bersih dan stack
            modern seperti React, Supabase, dan PHP. Prosesnya jelas dari brief sampai serah terima.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onConsult} className="btn btn-primary glitch-host px-6 py-3.5 text-[15px]">
              <MessagesSquare aria-hidden className="size-4" />
              <ScrambleText text="Konsultasi Sekarang" />
            </button>
            <a href="#portofolio" className="btn btn-ghost glitch-host px-6 py-3.5 text-[15px]">
              <ScrambleText text="Lihat Portofolio" />
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>

          <TechLogos names={HERO_STACK} size="lg" label="Stack yang dikerjakan" className="mt-9" />
        </div>

        <div style={{ animationDelay: '120ms' }} className="animate__animated animate__fadeInUp animate__faster min-w-0">
          <CodeWindow />
        </div>
      </div>
    </section>
  );
}
