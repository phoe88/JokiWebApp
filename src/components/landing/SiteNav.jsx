import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { NAV_SECTIONS } from '../../content/landing';
import { useActiveSection } from '../../hooks/useActiveSection';
import Logo from '../shell/Logo';
import ScrambleText from './ScrambleText';

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
                <a
                  href={`#${id}`}
                  onClick={onClose}
                  className="block rounded-xl px-3 py-3 font-display text-lg font-semibold text-ink hover:bg-white/5"
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="mt-2 border-t border-white/10 pt-2">
              <Link to="/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-ink-muted hover:bg-white/5">
                <LayoutDashboard aria-hidden className="size-4" />
                Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        <Link to="/services" className="btn btn-primary w-full">
          Mulai Project
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

        <nav aria-label="Menu utama" className="mx-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={active === id ? 'location' : undefined} className="nav-anchor glitch-host">
                  <ScrambleText text={label} />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link to="/dashboard" aria-label="Dashboard" title="Dashboard" className="icon-btn hidden md:inline-flex">
            <LayoutDashboard aria-hidden className="size-4" />
          </Link>
          <Link to="/services" className="btn btn-primary glitch-host hidden px-4 py-2 sm:inline-flex">
            <ScrambleText text="Mulai Project" />
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu"
            aria-expanded={drawerOpen}
            aria-controls="site-drawer"
            className="icon-btn md:hidden"
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
