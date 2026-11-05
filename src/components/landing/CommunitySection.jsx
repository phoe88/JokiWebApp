import { useState } from 'react';
import { ExternalLink, Hash, Users } from 'lucide-react';
import { COMMUNITY_CHANNELS } from '../../config/site';
import { COMMUNITY_BENEFITS, COMMUNITY_TOPICS } from '../../content/landing';
import Modal from '../Modal';
import Reveal from './Reveal';
import ScrambleText from './ScrambleText';

function ChannelList() {
  return (
    <ul className="flex flex-col gap-2.5">
      {COMMUNITY_CHANNELS.map(({ name, url, note }) => (
        <li key={name} className="glass-inset flex items-center justify-between gap-3 p-3.5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{name}</p>
            <p className="text-sm text-ink-muted">{note}</p>
          </div>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-cyber shrink-0 px-3 py-2 text-[13px]">
              Buka
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          ) : (
            <span className="badge badge--neutral">Segera dibuka</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function CommunitySection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="komunitas" aria-labelledby="komunitas-title" className="page-shell scroll-mt-28 py-20 lg:py-24">
      <Reveal className="glass relative overflow-hidden p-6 sm:p-10 lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-cyber/15 blur-3xl"
        />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full bg-live/10 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
          <div className="min-w-0">
            <p className="code-tag">{'// komunitas'}</p>
            <h2
              id="komunitas-title"
              className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
            >
              Belajar dan berkembang bareng
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Tempat klien dan developer JokiWebApp saling terhubung, bertukar ilmu, dan dapat kabar terbaru.
            </p>

            <ul className="mt-7 grid gap-5 sm:grid-cols-2">
              {COMMUNITY_BENEFITS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3">
                  <span className="icon-chip icon-chip--live">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <button type="button" onClick={() => setOpen(true)} className="btn btn-primary glitch-host mt-8 px-6 py-3.5 text-[15px]">
              <Users aria-hidden className="size-4" />
              <ScrambleText text="Gabung Komunitas" />
            </button>
          </div>

          <div aria-hidden className="glass-inset min-w-0 p-5">
            <p className="font-mono text-xs text-ink-dim">topik diskusi</p>
            <ul className="mt-3 flex flex-col gap-1">
              {COMMUNITY_TOPICS.map((topic, index) => (
                <li
                  key={topic}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 font-mono text-sm ${
                    index === 0 ? 'bg-live/10 text-ink' : 'text-ink-muted'
                  }`}
                >
                  <Hash className="size-3.5 text-live" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <Modal open={open} onClose={() => setOpen(false)} title="Gabung Komunitas" icon={Users}>
        <p className="mb-4 text-sm leading-relaxed text-ink-muted">Pilih kanal yang paling nyaman buat kamu.</p>
        <ChannelList />
      </Modal>
    </section>
  );
}
