import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutTemplate, Menu, X } from 'lucide-react';
import { NAV_SECTIONS } from '../../content/landing';
import { useActiveSection } from '../../hooks/useActiveSection';
import Logo from '../shell/Logo';
import ScrambleText from './ScrambleText';
import SectionLink from './SectionLink';

const CTA_LABEL = 'Mulai cari template website';

const SECTION_IDS = NAV_SECTIONS.map(({ id }) => id);

function MobileDrawer({ open, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
      closeRef.current.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id="site-drawer"
      aria-label="Menu"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="drawer"
    >
      <div className="drawer__panel">
        <div className="flex items-center justify-between">
          <Logo />
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Tutup menu" className="icon-btn">
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <nav aria-label="Menu utama" className="mt-6 flex-1">
          <ul className="flex flex-col gap-1">
            {NAV_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <SectionLink
                  id={id}
                  onClick={onClose}
                  className="block rounded-xl px-3 py-3 font-display text-lg font-semibold text-ink hover:bg-white/5"
                >
                  {label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <Link to="/templates" onClick={onClose} className="btn btn-primary w-full">
          <LayoutTemplate aria-hidden className="size-4" />
          {CTA_LABEL}
        </Link>
      </div>
    </dialog>
  );
}

export default function SiteNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);

  return (
    <header className="site-nav page-shell">
      <div className="glass glass-bar flex items-center gap-2 rounded-2xl py-2 pl-3 pr-2">
        <Logo />

        <nav aria-label="Menu utama" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <SectionLink id={id} aria-current={active === id ? 'location' : undefined} className="nav-anchor glitch-host">
                  <ScrambleText text={label} />
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link to="/templates" className="btn btn-primary glitch-host hidden px-4 py-2 sm:inline-flex">
            <ScrambleText text={CTA_LABEL} />
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu"
            aria-expanded={drawerOpen}
            aria-controls="site-drawer"
            className="icon-btn lg:hidden"
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
