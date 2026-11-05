import { LayoutDashboard, Radio, SquareTerminal, Store, Tag } from 'lucide-react';

export const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/services', label: 'Services', icon: Store },
  { to: '/live-feed', label: 'Live Feed', icon: Radio },
  { to: '/pricing', label: 'Pricing', icon: Tag },
  { to: '/terminal', label: 'Terminal', icon: SquareTerminal },
];

export const pageLabel = (pathname) =>
  pathname === '/' ? 'Home' : (NAV_LINKS.find(({ to }) => to === pathname)?.label ?? 'Not found');
