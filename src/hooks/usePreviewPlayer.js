import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Plays the 30-second song previews from search results, one at a time, through a
 * single audio element. The audio is streamed, never saved, as Apple's terms require.
 * `onPlay` fires whenever a preview starts.
 */
export function usePreviewPlayer({ onPlay, onError } = {}) {
  const audioRef = useRef(null);
  const callbacksRef = useRef({ onPlay, onError });
  callbacksRef.current = { onPlay, onError };

  const [currentId, setCurrentId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | playing | paused
  const [progress, setProgress] = useState(0);

  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    audio.preload = 'none';
    audio.addEventListener('playing', () => {
      setStatus('playing');
      callbacksRef.current.onPlay?.();
    });
    audio.addEventListener('waiting', () => setStatus('loading'));
    audio.addEventListener('pause', () => setStatus((current) => (current === 'idle' ? current : 'paused')));
    audio.addEventListener('ended', () => {
      setStatus('idle');
      setProgress(0);
    });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    });
    audioRef.current = audio;
    return audio;
  }, []);

  const toggle = useCallback(
    async (song) => {
      const audio = getAudio();
      const same = currentId === song.id && status !== 'idle';

      if (same && (status === 'playing' || status === 'loading')) {
        audio.pause();
        return;
      }

      if (!same) {
        audio.src = song.previewUrl;
        setCurrentId(song.id);
        setProgress(0);
      }
      setStatus('loading');
      try {
        await audio.play();
      } catch (error) {
        if (error.name === 'AbortError') return; // a newer song replaced this one
        setStatus('idle');
        callbacksRef.current.onError?.(new Error('Pratinjau lagu ini tidak bisa diputar. Coba lagu lain.'));
      }
    },
    [currentId, status, getAudio],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  useEffect(
    () => () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
    },
    [],
  );

  return {
    currentId,
    status,
    progress,
    toggle,
    pause,
    isActive: (id) => currentId === id && status !== 'idle',
  };
}
