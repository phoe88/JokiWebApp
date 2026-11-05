import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../config/nav';
import { SidebarAccount } from './AccountControl';
import Logo from './Logo';

/** Floating glass rail from lg. It widens into labelled rows at xl. */
export default function Sidebar() {
  return (
    <aside className="glass sidebar hidden lg:flex">
      <div className="flex justify-center px-0 pb-1 pt-1 xl:justify-start xl:px-2">
        <Logo chipClassName="xl:hidden" wordClassName="hidden xl:inline" />
      </div>

      <nav aria-label="Primary" className="mt-6 flex-1">
        <ul className="flex flex-col gap-1.5">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className="nav-item">
                <Icon aria-hidden className="size-5 shrink-0" />
                <span className="nav-label">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 pt-3">
        <SidebarAccount />
      </div>
    </aside>
  );
}
