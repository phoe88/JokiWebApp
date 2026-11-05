import { useSyncExternalStore } from 'react';

/** Mirrors the breakpoints of the GRID classes in ServiceCatalog.jsx. */
const STEPS = [
  { query: '(min-width: 1536px)', columns: 4 },
  { query: '(min-width: 1024px)', columns: 3 },
  { query: '(min-width: 640px)', columns: 2 },
];

function subscribe(onChange) {
  const lists = STEPS.map(({ query }) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener('change', onChange));
  return () => lists.forEach((list) => list.removeEventListener('change', onChange));
}

const getSnapshot = () => STEPS.find(({ query }) => window.matchMedia(query).matches)?.columns ?? 1;

export function useGridColumns() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
