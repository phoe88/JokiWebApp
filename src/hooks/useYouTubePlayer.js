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

const NO_TIME = { current: 0, duration: 0 };

/**
 * One embedded YouTube player. Nothing loads from YouTube until `play` is called,
 * so the page stays light and no YouTube cookies are set before then.
 * `video` is { videoId, title, channel }; `onPlay` fires whenever playback starts.
 * Errors from the player carry YouTube's error `code`.
 * With `trackTime`, `time` holds the elapsed and total seconds while it plays.
 */
export function useYouTubePlayer({ onPlay, onError, trackTime = false } = {}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const creatingRef = useRef(false);
  const wantedRef = useRef(null); // the video that should be playing, or null once stopped
  const callbacksRef = useRef({ onPlay, onError });
  callbacksRef.current = { onPlay, onError };

  const [video, setVideo] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | playing | paused | ended
  const [time, setTime] = useState(NO_TIME);

  const play = useCallback(async (next) => {
    setVideo(next);
    setStatus('loading');
    setTime(NO_TIME);
    wantedRef.current = next.videoId;

    if (playerRef.current) {
      // Before the player is ready, onReady picks up the wanted video instead.
      if (readyRef.current) playerRef.current.loadVideoById(next.videoId);
      return;
    }
    if (creatingRef.current) return;

    creatingRef.current = true;
    try {
      const YT = await loadYouTubeApi();
      if (!containerRef.current || !wantedRef.current) return;
      const mount = document.createElement('div');
      containerRef.current.replaceChildren(mount);
      playerRef.current = new YT.Player(mount, {
        host: 'https://www.youtube-nocookie.com',
        videoId: wantedRef.current,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: (event) => {
            readyRef.current = true;
            const wanted = wantedRef.current;
            if (!wanted) return;
            if (event.target.getVideoData?.().video_id === wanted) event.target.playVideo();
            else event.target.loadVideoById(wanted);
          },
          onStateChange: ({ data }) => {
            if (!wantedRef.current) return;
            if (data === YT.PlayerState.PLAYING) {
              setStatus('playing');
              callbacksRef.current.onPlay?.();
            } else if (data === YT.PlayerState.PAUSED) {
              setStatus('paused');
            } else if (data === YT.PlayerState.ENDED) {
              setStatus('ended');
            }
          },
          onError: ({ data }) => {
            setStatus('paused');
            const error = new Error(PLAYER_ERRORS[data] ?? 'Video ini tidak bisa diputar.');
            error.code = data;
            callbacksRef.current.onError?.(error);
          },
        },
      });
    } catch (error) {
      setStatus('idle');
      setVideo(null);
      callbacksRef.current.onError?.(error);
    } finally {
      creatingRef.current = false;
    }
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo?.();
  }, []);

  const resume = useCallback(() => {
    if (!wantedRef.current) return;
    playerRef.current?.playVideo?.();
  }, []);

  /** Stops playback for good (until the next `play`), even if the player is still loading. */
  const stop = useCallback(() => {
    wantedRef.current = null;
    playerRef.current?.stopVideo?.();
    setStatus('idle');
    setTime(NO_TIME);
  }, []);

  // Polls the elapsed time while playing; it only re-renders when a whole second passes.
  useEffect(() => {
    if (!trackTime || status !== 'playing') return undefined;
    const tick = () => {
      const player = playerRef.current;
      const current = Math.floor(player?.getCurrentTime?.() ?? 0);
      const duration = Math.round(player?.getDuration?.() ?? 0);
      setTime((previous) =>
        previous.current === current && previous.duration === duration ? previous : { current, duration },
      );
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [status, trackTime]);

  useEffect(
    () => () => {
      wantedRef.current = null;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      readyRef.current = false;
    },
    [],
  );

  return { containerRef, video, status, time, started: status !== 'idle', play, pause, resume, stop };
}
