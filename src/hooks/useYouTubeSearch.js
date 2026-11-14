import { useCallback, useEffect, useRef, useState } from 'react';
import { MUSIC_SEARCH_URL } from '../config/site';

/** Same words, same cache entry: on this page and on Vercel's CDN. */
const normalize = (query) => query.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Searches songs through the site's YouTube endpoint. Each search spends API quota,
 * so it runs on submit rather than on every keystroke, and repeats come from memory.
 * Returns { status: 'idle' | 'loading' | 'done' | 'error', query, items, error, search }.
 */
export function useYouTubeSearch() {
  const [state, setState] = useState({ status: 'idle', query: '', items: [], error: '' });
  const cacheRef = useRef(new Map());
  const controllerRef = useRef(null);

  const search = useCallback(async (input) => {
    const query = normalize(input);
    if (!query) return;

    controllerRef.current?.abort();
    const cached = cacheRef.current.get(query);
    if (cached) {
      setState({ status: 'done', query, items: cached, error: '' });
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setState((current) => ({ ...current, status: 'loading', query, error: '' }));

    try {
      const response = await fetch(`${MUSIC_SEARCH_URL}?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(payload?.items)) {
        throw new Error(payload?.error || 'Pencarian lagu sedang tidak tersedia. Coba lagi nanti.');
      }
      cacheRef.current.set(query, payload.items);
      setState({ status: 'done', query, items: payload.items, error: '' });
    } catch (error) {
      if (controller.signal.aborted) return;
      const message =
        error instanceof TypeError ? 'Tidak bisa terhubung ke server pencarian. Periksa koneksi internet kamu.' : error.message;
      setState({ status: 'error', query, items: [], error: message });
    }
  }, []);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return { ...state, search };
}
