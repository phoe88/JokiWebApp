import {
  Bot,
  CheckCheck,
  CircleDashed,
  Code2,
  Database,
  GraduationCap,
  LoaderCircle,
  Lock,
  Palette,
  ShieldCheck,
  Wifi,
} from 'lucide-react';

export const ALL_CATEGORY = 'All';

export const CATEGORIES = [
  { name: 'Web Development', icon: Code2, cover: 'cover--ember' },
  { name: 'UI/UX Design', icon: Palette, cover: 'cover--dusk' },
  { name: 'Automation & Bots', icon: Bot, cover: 'cover--jade' },
  { name: 'Academic Scripts', icon: GraduationCap, cover: 'cover--honey' },
  { name: 'Database & Backend', icon: Database, cover: 'cover--lagoon' },
];

export const CATEGORY_TABS = [ALL_CATEGORY, ...CATEGORIES.map((category) => category.name)];

const categoryOf = (name) => CATEGORIES.find((category) => category.name === name);

export const categoryIcon = (name) => categoryOf(name)?.icon ?? Code2;
export const categoryCover = (name) => categoryOf(name)?.cover ?? 'cover--ember';

export const SERVICE_STATUS = {
  SECURE: { icon: ShieldCheck, className: 'badge--live' },
  ONLINE: { icon: Wifi, className: 'badge--live' },
  ENCRYPTED: { icon: Lock, className: 'badge--cyber' },
};

export const ORDER_STEPS = ['pending', 'in_progress', 'completed'];

export const ORDER_STATUS = {
  pending: { label: 'Pending', icon: CircleDashed, className: 'badge--neutral', dot: 'rgb(var(--ink-dim))' },
  in_progress: { label: 'In progress', icon: LoaderCircle, className: 'badge--cyber', dot: 'rgb(var(--cyber))' },
  completed: { label: 'Completed', icon: CheckCheck, className: 'badge--live', dot: 'rgb(var(--live))' },
};

export const ctaLabel = (service) =>
  service.status === 'ONLINE' ? 'Select Service' : 'Initialize Protocol';
