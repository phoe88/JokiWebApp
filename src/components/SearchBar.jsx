import { Search, X } from 'lucide-react';

const PLACEHOLDER = '> Search services, templates, or custom code repositories...';

export default function SearchBar({ value, onChange, onSubmit, className = '' }) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className={`search-shell flex items-center gap-3 rounded-2xl px-4 ${className}`}
    >
      <Search aria-hidden className="size-5 shrink-0 text-cyber-soft" />
      <label htmlFor="service-search" className="sr-only">
        Search services
      </label>
      <input
        id="service-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={PLACEHOLDER}
        autoComplete="off"
        spellCheck={false}
        className="h-14 w-full min-w-0 flex-1 text-ellipsis bg-transparent text-base text-ink placeholder:text-ink-dim focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="rounded-lg p-1 text-ink-muted hover:text-ink"
        >
          <X aria-hidden className="size-5" />
        </button>
      )}
    </form>
  );
}
