import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Song search through Apple's iTunes Search API: free, no key, and callable straight
 * from the browser, so it works on GitHub Pages too. Apple allows about 20 searches a
 * minute per visitor, so it runs on submit and repeats come from memory.
 * https://performance-partners.apple.com/search-api
 */
const SEARCH_URL = 'https://itunes.apple.com/search';
const MAX_QUERY_LENGTH = 100;

/** Same words, same cache entry. */
const normalize = (query) => query.trim().replace(/\s+/g, ' ').toLowerCase();

/** Keeps the fields the page uses. `duration` is the song's length in seconds. */
function toSong(result) {
  return {
    id: String(result.trackId),
    title: result.trackName,
    artist: result.artistName,
    album: result.collectionName,
    artwork: result.artworkUrl100?.replace(/\/100x100bb\./, '/200x200bb.'),
    duration: Math.round((result.trackTimeMillis ?? 0) / 1000),
    previewUrl: result.previewUrl,
  };
}

/**
 * Returns { status: 'idle' | 'loading' | 'done' | 'error', query, items, error, search }.
 * Each item is { id, title, artist, album, artwork, duration, previewUrl }.
 */
export function useSongSearch() {
  const [state, setState] = useState({ status: 'idle', query: '', items: [], error: '' });
  const cacheRef = useRef(new Map());
  const controllerRef = useRef(null);

  const search = useCallback(async (input) => {
    const query = normalize(input).slice(0, MAX_QUERY_LENGTH);
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

    const url = new URL(SEARCH_URL);
    url.search = new URLSearchParams({
      term: query,
      media: 'music',
      entity: 'song',
      country: 'ID',
      explicit: 'No',
      limit: '20',
    }).toString();

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (response.status === 403 || response.status === 429) {
        throw new Error('Terlalu banyak pencarian dalam semenit. Tunggu sebentar lalu coba lagi.');
      }
      const payload = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(payload?.results)) {
        throw new Error('Pencarian lagu sedang tidak tersedia. Coba lagi nanti.');
      }
      const items = payload.results.filter((result) => result.kind === 'song').map(toSong);
      cacheRef.current.set(query, items);
      setState({ status: 'done', query, items, error: '' });
    } catch (error) {
      if (controller.signal.aborted) return;
      const message =
        error instanceof TypeError ? 'Tidak bisa terhubung ke pencarian lagu. Periksa koneksi internet kamu.' : error.message;
      setState({ status: 'error', query, items: [], error: message });
    }
  }, []);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return { ...state, search };
}
