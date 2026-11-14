import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { SERVICES } from '../../content/landing';
import GlowCard from './GlowCard';
import Reveal from './Reveal';
import ScrambleText from './ScrambleText';
import SectionHeading from './SectionHeading';

export default function ServicesSection() {
  return (
    <section id="layanan" aria-labelledby="layanan-title" className="page-shell scroll-mt-28 py-20 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          title={<span id="layanan-title">Apa yang bisa dikerjakan</span>}
          body="Dari web baru sampai perbaikan project yang macet, pilih bantuan yang kamu butuhkan."
        />
        <Reveal>
          <Link to="/templates" className="btn btn-ghost glitch-host">
            <ScrambleText text="Lihat Template" />
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-12">
        {SERVICES.map(({ id, icon: Icon, title, body, points, span }, index) => (
          <Reveal key={id} delay={index * 70} className={`min-w-0 ${span}`}>
            <GlowCard className="flex h-full flex-col p-6 sm:p-7">
              <span className="icon-chip icon-chip--live size-11 rounded-2xl">
                <Icon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-ink">
                <ScrambleText text={title} />
              </h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-muted">{body}</p>
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
                {points.map((point) => (
                  <li key={point} className="flex items-center gap-1.5 text-sm text-ink-muted">
                    <Check aria-hidden className="size-3.5 text-live" />
                    {point}
                  </li>
                ))}
              </ul>
            </GlowCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
