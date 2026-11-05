import { APP_NAME } from '../config/brand';

export default function Footer() {
  return (
    <footer className="mt-10 flex flex-wrap justify-between gap-x-6 gap-y-1 px-2 pb-1 text-xs text-ink-dim">
      <p className="font-display font-semibold">{APP_NAME}</p>
      <p>© {new Date().getFullYear()} {APP_NAME}</p>
    </footer>
  );
}
