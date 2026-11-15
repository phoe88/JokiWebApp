import { useCallback, useEffect, useRef, useState } from 'react';
import { SONG_VIDEO_URL } from '../config/site';
import { usePreviewPlayer } from './usePreviewPlayer';
import { useYouTubePlayer } from './useYouTubePlayer';

/** Player errors that mean "this video can't play here", so the next match is worth a try. */
const TRY_NEXT = new Set([2, 5, 100, 101, 150]);

/** Asks api/song-video.js for the YouTube videos that match a song, best first. */
async function findVideos(song, signal) {
  const url = new URL(SONG_VIDEO_URL, window.location.href);
  url.search = new URLSearchParams({
    artist: song.artist ?? '',
    title: song.title,
    ...(song.duration ? { duration: String(song.duration) } : {}),
  }).toString();
  const response = await fetch(url, { signal });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(payload?.candidates)) throw new Error(payload?.error ?? 'lookup failed');
  return payload.candidates;
}

/**
 * Plays a search result from start to finish. It finds the song's video on YouTube
 * and plays it in a hidden player (`containerRef` goes on that player's element), so
 * the song runs for its full length and keeps going while the panel is closed.
 * If no playable video turns up, it plays iTunes' 30-second preview instead and
 * says so through `onNotice`.
 *
 * Returns { song, source: 'full' | 'preview' | null, status, time, containerRef,
 * toggle, pause, isActive }. `status` is idle | finding | loading | playing | paused | ended.
 */
export function useSongPlayer({ onPlay, onNotice } = {}) {
  const [song, setSong] = useState(null);
  const [source, setSource] = useState(null);
  const [finding, setFinding] = useState(false);

  const cacheRef = useRef(new Map());
  const controllerRef = useRef(null);
  const attemptRef = useRef({ song: null, candidates: [], index: 0 });
  const callbacksRef = useRef({ onPlay, onNotice });
  callbacksRef.current = { onPlay, onNotice };

  const fallbackRef = useRef(() => {});
  const youtube = useYouTubePlayer({
    trackTime: true,
    onPlay: () => callbacksRef.current.onPlay?.(),
    onError: (error) => {
      const attempt = attemptRef.current;
      const next = attempt.candidates[attempt.index + 1];
      if (TRY_NEXT.has(error.code) && next) {
        attempt.index += 1;
        youtube.play(next);
      } else {
        fallbackRef.current(attempt.song);
      }
    },
  });
  const preview = usePreviewPlayer({
    onPlay: () => callbacksRef.current.onPlay?.(),
    onError: (error) => {
      setSource(null);
      callbacksRef.current.onNotice?.({ tone: 'error', title: 'Gagal memutar lagu', body: error.message });
    },
  });

  // `reason` is 'busy' when the lookup itself was unavailable, otherwise no playable video was found.
  fallbackRef.current = (failed, reason) => {
    if (!failed || attemptRef.current.song?.id !== failed.id) return;
    youtube.stop();
    if (!failed.previewUrl) {
      setSource(null);
      callbacksRef.current.onNotice?.({
        tone: 'error',
        title: 'Lagu tidak bisa diputar',
        body:
          reason === 'busy'
            ? 'Pencarian lagu lengkap sedang sibuk. Coba lagi sebentar lagi.'
            : 'Versi lengkap lagu ini tidak ditemukan. Coba lagu lain.',
      });
      return;
    }
    setSource('preview');
    preview.toggle(failed);
    callbacksRef.current.onNotice?.({
      tone: 'info',
      title: 'Memutar pratinjau 30 detik',
      body:
        reason === 'busy'
          ? 'Pencarian lagu lengkap sedang sibuk, jadi yang diputar pratinjaunya dari iTunes. Coba lagi sebentar lagi.'
          : `Versi lengkap “${failed.title}” tidak bisa diputar di sini, jadi yang diputar pratinjaunya dari iTunes.`,
    });
  };

  const start = useCallback(
    async (next) => {
      controllerRef.current?.abort();
      youtube.stop();
      preview.stop();
      setSong(next);
      setSource('full');
      attemptRef.current = { song: next, candidates: [], index: 0 };

      let candidates = cacheRef.current.get(next.id);
      let reason;
      if (!candidates) {
        const controller = new AbortController();
        controllerRef.current = controller;
        setFinding(true);
        try {
          candidates = await findVideos(next, controller.signal);
          cacheRef.current.set(next.id, candidates);
        } catch {
          if (controller.signal.aborted) return;
          candidates = [];
          reason = 'busy';
        } finally {
          if (controllerRef.current === controller) setFinding(false);
        }
      }

      if (attemptRef.current.song !== next) return;
      attemptRef.current.candidates = candidates;
      if (candidates.length) youtube.play(candidates[0]);
      else fallbackRef.current(next, reason);
    },
    [youtube.stop, youtube.play, preview.stop],
  );

  const active = source === 'preview' ? preview : youtube;
  const status = finding ? 'finding' : song ? active.status : 'idle';

  // While the song is still being found or its player is still loading, pausing cancels it outright.
  const pause = useCallback(() => {
    if (finding) {
      controllerRef.current?.abort();
      setFinding(false);
      setSong(null);
      return;
    }
    if (source === 'full' && youtube.status === 'loading') {
      youtube.stop();
      return;
    }
    youtube.pause();
    preview.pause();
  }, [finding, source, youtube.status, youtube.stop, youtube.pause, preview.pause]);

  const toggle = useCallback(
    (next) => {
      const same = song?.id === next.id && status !== 'idle' && status !== 'ended';
      if (!same) return start(next);
      if (status === 'playing' || status === 'loading' || status === 'finding') return pause();
      if (source === 'preview') return preview.toggle(next);
      return youtube.resume();
    },
    [song, status, source, start, pause, preview.toggle, youtube.resume],
  );

  useEffect(() => () => controllerRef.current?.abort(), []);

  // The preview reports its own length; the full song falls back to iTunes' length until YouTube reports one.
  const time =
    source === 'preview'
      ? preview.time
      : { current: youtube.time.current, duration: youtube.time.duration || song?.duration || 0 };

  return {
    song,
    source,
    status,
    time,
    containerRef: youtube.containerRef,
    toggle,
    pause,
    isActive: (id) => song?.id === id && status !== 'idle' && status !== 'ended',
  };
}
