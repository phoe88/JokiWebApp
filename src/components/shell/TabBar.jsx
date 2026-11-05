import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../config/nav';

/** Fixed glass tab bar below lg, clear of the home indicator. */
export default function TabBar() {
  return (
    <nav aria-label="Primary" className="glass-raised tabbar lg:hidden">
      <ul className="grid h-full grid-cols-5 gap-0.5">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="min-w-0">
            <NavLink to={to} className="tab-item">
              <Icon aria-hidden className="size-5 shrink-0" />
              <span className="max-w-full truncate">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
