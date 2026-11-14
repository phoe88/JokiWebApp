import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FolderCode, Info } from 'lucide-react';
import { ALL_PROJECTS, PORTFOLIO_FILTERS, PROJECTS } from '../../content/landing';
import Modal from '../Modal';
import GlowCard from './GlowCard';
import ProjectMockup from './ProjectMockup';
import Reveal from './Reveal';
import ScrambleText from './ScrambleText';
import SectionHeading from './SectionHeading';
import TechLogos from './TechLogos';

function SampleTag() {
  return <span className="demo-tag">Contoh</span>;
}

function ProjectCard({ project, onDetails, index }) {
  return (
    <GlowCard
      style={{ animationDelay: `${index * 60}ms` }}
      className="animate__animated animate__fadeInUp animate__faster flex min-w-0 flex-col p-3"
    >
      <ProjectMockup kind={project.mock} />
      <div className="flex flex-1 flex-col p-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-ink-dim">{project.category}</p>
          {project.sample && <SampleTag />}
        </div>
        <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink">{project.title}</h3>
        <p className="mb-4 mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">{project.summary}</p>
        <TechLogos names={project.stack} />
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => onDetails(project)} className="btn btn-ghost flex-1 px-3 py-2 text-[13px]">
            <Info aria-hidden className="size-3.5" />
            Details
          </button>
          {project.previewUrl && (
            <Link to={project.previewUrl} className="btn btn-cyber flex-1 px-3 py-2 text-[13px]">
              <ExternalLink aria-hidden className="size-3.5" />
              Live Preview
            </Link>
          )}
        </div>
      </div>
    </GlowCard>
  );
}

function ProjectDetails({ project, onClose }) {
  return (
    <Modal open={Boolean(project)} onClose={onClose} title={project?.title} icon={FolderCode} wide>
      {project && (
        <>
          <ProjectMockup kind={project.mock} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-sm text-ink-dim">{project.category}</p>
            {project.sample && <SampleTag />}
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{project.summary}</p>
          <ul className="mt-4 flex flex-col gap-1.5">
            {project.details.map((detail) => (
              <li key={detail} className="flex items-start gap-2 text-sm text-ink-muted">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-live" />
                {detail}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <TechLogos names={project.stack} />
          </div>
          {project.sample && (
            <p className="glass-inset mt-4 p-3 text-sm text-ink-muted">
              Ini konsep tampilan untuk contoh, bukan karya untuk klien.
            </p>
          )}
          {project.previewUrl && (
            <Link to={project.previewUrl} className="btn btn-primary mt-5 w-full">
              <ExternalLink aria-hidden className="size-4" />
              Live Preview
            </Link>
          )}
        </>
      )}
    </Modal>
  );
}

export default function PortfolioSection() {
  const [filter, setFilter] = useState(ALL_PROJECTS);
  const [selected, setSelected] = useState(null);

  const visible = useMemo(
    () => PROJECTS.filter(({ category }) => filter === ALL_PROJECTS || category === filter),
    [filter],
  );

  return (
    <section id="portofolio" aria-labelledby="portofolio-title" className="page-shell scroll-mt-28 py-20 lg:py-24">
      <SectionHeading
        title={<span id="portofolio-title">Hasil kerja yang bisa kamu lihat</span>}
        body="Beberapa project yang sudah dikerjakan, dari dashboard sampai landing page."
      />

      <Reveal
        role="group"
        aria-label="Filter portofolio"
        className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {PORTFOLIO_FILTERS.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
            className="pill glitch-host"
          >
            <ScrambleText text={name} />
          </button>
        ))}
      </Reveal>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {visible.map((project, index) => (
          <ProjectCard key={`${filter}-${project.id}`} project={project} index={index} onDetails={setSelected} />
        ))}
      </div>

      <p className="mt-6 flex items-center gap-2 text-sm text-ink-dim">
        <SampleTag />
        Proyek bertanda ini adalah konsep tampilan, bukan karya untuk klien.
      </p>

      <ProjectDetails project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
