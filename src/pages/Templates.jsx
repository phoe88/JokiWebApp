import { useDeferredValue, useMemo, useState } from 'react';
import { Info, LayoutTemplate, LoaderCircle, Search, SearchX, Send, X } from 'lucide-react';
import Modal from '../components/Modal';
import Notice from '../components/Notice';
import SignInGate from '../components/SignInGate';
import GlowCard from '../components/landing/GlowCard';
import ProjectMockup from '../components/landing/ProjectMockup';
import ScrambleText from '../components/landing/ScrambleText';
import SitePage from '../components/shell/SitePage';
import { displayNameOf } from '../components/shell/AccountControl';
import { WHATSAPP_NUMBER } from '../config/site';
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES, TEMPLATES } from '../content/templates';
import { useAuth } from '../context/AuthContext';

const searchableText = ({ name, category, summary, pages, features, stack }) =>
  [name, category, summary, ...pages, ...features, ...stack].join(' ').toLowerCase();

const INDEX = TEMPLATES.map((template) => ({ template, text: searchableText(template) }));

/** Every word of the query has to appear somewhere in the template. */
function filterTemplates(query, category) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return INDEX.filter(
    ({ template, text }) =>
      (category === ALL_TEMPLATES || template.category === category) && words.every((word) => text.includes(word)),
  ).map(({ template }) => template);
}

function orderUrl(template) {
  const message = `Halo JokiWebApp, saya tertarik dengan template "${template.name}" (${template.category}). Bisa dibantu?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function OrderLink({ template, className }) {
  if (!WHATSAPP_NUMBER) return null;
  return (
    <a href={orderUrl(template)} target="_blank" rel="noopener noreferrer" className={className}>
      <Send aria-hidden className="size-3.5" />
      Pakai Template
    </a>
  );
}

function Tags({ label, items }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className="tech-tag">
          {item}
        </li>
      ))}
    </ul>
  );
}

function TemplateCard({ template, index, onDetails }) {
  return (
    <GlowCard
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      className="animate__animated animate__fadeInUp animate__faster flex min-w-0 flex-col p-3"
    >
      <ProjectMockup kind={template.mock} />
      <div className="flex flex-1 flex-col p-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-ink-dim">{template.category}</p>
          <span className="demo-tag">Contoh</span>
        </div>
        <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink">
          <ScrambleText text={template.name} />
        </h2>
        <p className="mb-4 mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">{template.summary}</p>
        <Tags label="Teknologi" items={template.stack} />
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => onDetails(template)} className="btn btn-ghost flex-1 px-3 py-2 text-[13px]">
            <Info aria-hidden className="size-3.5" />
            Detail
          </button>
          <OrderLink template={template} className="btn btn-primary flex-1 px-3 py-2 text-[13px]" />
        </div>
      </div>
    </GlowCard>
  );
}

function TemplateDetails({ template, onClose }) {
  return (
    <Modal open={Boolean(template)} onClose={onClose} title={template?.name} icon={LayoutTemplate} wide>
      {template && (
        <>
          <ProjectMockup kind={template.mock} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-sm text-ink-dim">{template.category}</p>
            <span className="demo-tag">Contoh</span>
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{template.summary}</p>

          <h3 className="mt-5 text-sm font-semibold text-ink">Halaman</h3>
          <div className="mt-2">
            <Tags label="Halaman" items={template.pages} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-ink">Fitur</h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {template.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink-muted">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-live" />
                {feature}
              </li>
            ))}
          </ul>

          <h3 className="mt-4 text-sm font-semibold text-ink">Teknologi</h3>
          <div className="mt-2">
            <Tags label="Teknologi" items={template.stack} />
          </div>

          <p className="glass-inset mt-5 p-3 text-sm text-ink-muted">
            Ini konsep tampilan. Isi, warna, dan fitur disesuaikan dengan brand dan kebutuhan kamu sebelum diserahkan.
          </p>
          <OrderLink template={template} className="btn btn-primary mt-5 w-full" />
        </>
      )}
    </Modal>
  );
}

function TemplateBrowser({ user }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_TEMPLATES);
  const [selected, setSelected] = useState(null);
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => filterTemplates(deferredQuery, category), [deferredQuery, category]);
  const filtered = query.trim() !== '' || category !== ALL_TEMPLATES;
  const reset = () => {
    setQuery('');
    setCategory(ALL_TEMPLATES);
  };

  return (
    <>
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Cari template website
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
          Halo, <span className="text-ink">{displayNameOf(user)}</span>. Pilih tampilan yang paling dekat dengan
          kebutuhan kamu, lalu kami sesuaikan isinya.
        </p>
      </header>

      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="search-shell mt-8 flex items-center gap-3 rounded-2xl px-4"
      >
        <Search aria-hidden className="size-5 shrink-0 text-cyber-soft" />
        <label htmlFor="template-search" className="sr-only">
          Cari template
        </label>
        <input
          id="template-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama, jenis, atau fitur, misalnya toko, dashboard, WhatsApp"
          autoComplete="off"
          spellCheck={false}
          className="h-14 w-full min-w-0 flex-1 text-ellipsis bg-transparent text-base text-ink placeholder:text-ink-dim focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Hapus pencarian"
            className="rounded-lg p-1 text-ink-muted hover:text-ink"
          >
            <X aria-hidden className="size-5" />
          </button>
        )}
      </form>

      <div
        role="group"
        aria-label="Filter jenis template"
        className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {TEMPLATE_CATEGORIES.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
            className="pill glitch-host shrink-0"
          >
            <ScrambleText text={name} />
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-5 text-sm text-ink-dim">
        {results.length} template{filtered ? ' cocok' : ''}
      </p>

      {results.length > 0 ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {results.map((template, index) => (
            <TemplateCard key={`${category}-${template.id}`} template={template} index={index} onDetails={setSelected} />
          ))}
        </div>
      ) : (
        <Notice
          icon={SearchX}
          title="Template tidak ditemukan"
          body="Coba kata lain atau pilih jenis yang berbeda. Kalau belum ada yang cocok, kami bisa buat dari nol lewat konsultasi."
          action={
            <button type="button" onClick={reset} className="btn btn-ghost mt-6">
              Tampilkan semua template
            </button>
          }
        />
      )}

      <p className="mt-6 flex items-center gap-2 text-sm text-ink-dim">
        <span className="demo-tag">Contoh</span>
        Template di sini adalah konsep tampilan dan disesuaikan sebelum dipakai.
      </p>

      <TemplateDetails template={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default function Templates() {
  const { user, loading } = useAuth();

  return (
    <SitePage>
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-ink-dim">
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
          Memeriksa sesi
        </p>
      ) : user ? (
        <TemplateBrowser user={user} />
      ) : (
        <SignInGate
          title="Masuk untuk mencari template"
          body="Template website hanya bisa dilihat setelah kamu masuk. Belum punya akun? Daftar gratis, cukup dengan email."
        />
      )}
    </SitePage>
  );
}
