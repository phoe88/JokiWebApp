import { useCallback, useEffect, useRef, useState } from 'react';
import { createSynth, isAudioSupported } from '../lib/synth';

/**
 * Plays one track at a time. Starting a track pauses whatever was playing, and each
 * track remembers where it was paused. Tracks with `src` play that file through an
 * audio element; the rest are synthesised.
 */
export function usePlaylistPlayer({ onError } = {}) {
  const [currentId, setCurrentId] = useState(null);
  const [playing, setPlaying] = useState(false);
  const synthRef = useRef(null);
  const audioRef = useRef(new Map());
  const positionsRef = useRef(new Map());
  const activeRef = useRef(null);

  const halt = useCallback(() => {
    const active = activeRef.current;
    if (!active) return;
    if (active.src) {
      audioRef.current.get(active.id)?.pause();
    } else if (synthRef.current) {
      positionsRef.current.set(active.id, synthRef.current.stop());
    }
    activeRef.current = null;
  }, []);

  const pause = useCallback(() => {
    halt();
    setPlaying(false);
  }, [halt]);

  const play = useCallback(
    async (track) => {
      halt();
      activeRef.current = track;
      setCurrentId(track.id);
      setPlaying(true);

      try {
        if (track.src) {
          let audio = audioRef.current.get(track.id);
          if (!audio) {
            audio = new Audio(track.src);
            audio.addEventListener('ended', () => {
              if (activeRef.current?.id === track.id) {
                activeRef.current = null;
                setPlaying(false);
              }
            });
            audioRef.current.set(track.id, audio);
          }
          await audio.play();
        } else {
          if (!isAudioSupported()) throw new Error('Browser ini tidak mendukung pemutaran audio.');
          synthRef.current ??= createSynth();
          await synthRef.current.start(track, positionsRef.current.get(track.id) ?? 0);
        }
      } catch (error) {
        if (activeRef.current?.id === track.id) {
          activeRef.current = null;
          setPlaying(false);
        }
        onError?.(error);
      }
    },
    [halt, onError],
  );

  const toggle = useCallback(
    (track) => (playing && currentId === track.id ? pause() : play(track)),
    [playing, currentId, pause, play],
  );

  // Leaving the page stops the music.
  useEffect(() => halt, [halt]);

  return { currentId, playing, toggle, pause, isPlaying: (id) => playing && currentId === id };
}

const FAVORITES_KEY = 'jokiwebapp:favorite-tracks';

function readFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

/** Favourite track ids, remembered in this browser when storage is available. */
export function useFavoriteTracks() {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch {
      // Private windows can refuse storage; favourites then last for this visit only.
    }
  }, [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { isFavorite: (id) => favorites.has(id), toggleFavorite };
}
