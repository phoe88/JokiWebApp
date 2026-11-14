import { Link } from 'react-router-dom';
import { APP_NAME } from '../../config/brand';
import { COMMUNITY_CHANNELS, SOCIAL_LINKS } from '../../config/site';
import { NAV_SECTIONS } from '../../content/landing';
import Logo from '../shell/Logo';
import SectionLink from './SectionLink';

const linkClass = 'rounded text-sm text-ink-muted hover:text-ink';

function FooterColumn({ title, children }) {
  return (
    <nav aria-label={title}>
      <h2 className="font-display text-sm font-semibold text-ink">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2">{children}</ul>
    </nav>
  );
}

export default function SiteFooter() {
  const handles = [...COMMUNITY_CHANNELS, ...SOCIAL_LINKS].filter(({ url }) => url);

  return (
    <footer className="page-shell pb-24 pt-6">
      <div className="section-rule" />
      <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
            Web development dan pengerjaan project dengan kode bersih dan stack modern.
          </p>
        </div>

        <FooterColumn title="Navigasi">
          {NAV_SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <SectionLink id={id} className={linkClass}>
                {label}
              </SectionLink>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Template">
          <li>
            <Link to="/templates" className={linkClass}>
              Cari Template
            </Link>
          </li>
        </FooterColumn>

        <FooterColumn title="Komunitas">
          {handles.length > 0 ? (
            handles.map(({ name, url }) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {name}
                </a>
              </li>
            ))
          ) : (
            <li className="text-sm text-ink-dim">Segera dibuka</li>
          )}
        </FooterColumn>
      </div>

      <p className="mt-10 text-xs text-ink-dim">
        © {new Date().getFullYear()} {APP_NAME}. Seluruh hak cipta dilindungi.
      </p>
    </footer>
  );
}
