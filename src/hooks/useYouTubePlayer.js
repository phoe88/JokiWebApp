import { useCallback, useEffect, useRef, useState } from 'react';

let apiPromise;

/** Loads YouTube's IFrame Player API once, the first time someone presses play. */
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      apiPromise = undefined;
      script.remove();
      reject(new Error('Player YouTube tidak bisa dimuat. Periksa koneksi internet kamu.'));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

const PLAYER_ERRORS = {
  2: 'Video ini tidak bisa diputar.',
  5: 'Video ini tidak bisa diputar di browser kamu.',
  100: 'Video ini sudah dihapus atau dijadikan privat.',
  101: 'Pemilik video tidak mengizinkan video ini diputar di situs lain.',
  150: 'Pemilik video tidak mengizinkan video ini diputar di situs lain.',
};

/**
 * One embedded YouTube player. Nothing loads from YouTube until `play` is called,
 * so the page stays light and no YouTube cookies are set before then.
 * `video` is { videoId, title, channel }; `onPlay` fires whenever playback starts.
 */
export function useYouTubePlayer({ onPlay, onError } = {}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const callbacksRef = useRef({ onPlay, onError });
  callbacksRef.current = { onPlay, onError };

  const [video, setVideo] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | playing | paused

  const play = useCallback(async (next) => {
    setVideo(next);
    setStatus('loading');

    if (playerRef.current) {
      playerRef.current.loadVideoById(next.videoId);
      return;
    }

    try {
      const YT = await loadYouTubeApi();
      if (!containerRef.current) return;
      const mount = document.createElement('div');
      containerRef.current.replaceChildren(mount);
      playerRef.current = new YT.Player(mount, {
        host: 'https://www.youtube-nocookie.com',
        videoId: next.videoId,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: (event) => event.target.playVideo(),
          onStateChange: ({ data }) => {
            if (data === YT.PlayerState.PLAYING) {
              setStatus('playing');
              callbacksRef.current.onPlay?.();
            } else if (data === YT.PlayerState.PAUSED || data === YT.PlayerState.ENDED) {
              setStatus('paused');
            }
          },
          onError: ({ data }) => {
            setStatus('paused');
            callbacksRef.current.onError?.(new Error(PLAYER_ERRORS[data] ?? 'Video ini tidak bisa diputar.'));
          },
        },
      });
    } catch (error) {
      setStatus('idle');
      setVideo(null);
      callbacksRef.current.onError?.(error);
    }
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo?.();
  }, []);

  useEffect(
    () => () => {
      playerRef.current?.destroy?.();
      playerRef.current = null;
    },
    [],
  );

  return { containerRef, video, status, started: status !== 'idle', play, pause };
}
