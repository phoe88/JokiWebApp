import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { pageLabel } from '../../config/nav';
import { useConnection } from '../../context/ConnectionContext';
import { isDemoMode } from '../../lib/SupabaseClient';
import ConnectionBadge from '../ConnectionBadge';
import DemoTag from '../DemoTag';
import { TopBarAccount } from './AccountControl';
import Logo from './Logo';

function Breadcrumb() {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 lg:block">
      <ol className="flex items-center gap-1.5 text-sm">
        {pathname === '/' ? (
          <li className="font-semibold text-ink">Home</li>
        ) : (
          <>
            <li>
              <Link to="/" className="rounded text-ink-dim hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-4 text-ink-dim" />
            </li>
            <li aria-current="page" className="truncate font-semibold text-ink">
              {pageLabel(pathname)}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

export default function TopBar() {
  const connection = useConnection();

  return (
    <header className="glass glass-bar topbar">
      <div className="lg:hidden">
        <Logo chipClassName="min-[350px]:hidden" wordClassName="hidden min-[350px]:inline" />
      </div>
      <Breadcrumb />

      <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
        {connection && <ConnectionBadge connection={connection} />}
        {isDemoMode && <DemoTag />}
        <TopBarAccount />
      </div>
    </header>
  );
}
