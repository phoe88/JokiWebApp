import { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, Music, Pause, Play, X } from 'lucide-react';
import { TRACKS } from '../../content/playlist';
import { useToast } from '../../context/ToastContext';
import { useFavoriteTracks, usePlaylistPlayer } from '../../hooks/usePlaylistPlayer';
import { useSongPlayer } from '../../hooks/useSongPlayer';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import Modal from '../Modal';
import { Equalizer, FeaturedSong, SongSearch } from './SongSpotlight';
import TrackArt from './TrackArt';
import TrackCard from './TrackCard';

function TrackDetails({ track, playing, favorite, onTogglePlay, onToggleFavorite, onClose }) {
  const facts = track && [
    ['Genre', track.genre],
    ['Suasana', track.mood],
    ...(track.src ? [] : [['Tempo', `${track.synth.bpm} BPM`], ['Nada dasar', track.synth.key]]),
  ];

  return (
    <Modal open={Boolean(track)} onClose={onClose} title={track?.title} icon={Music}>
      {track && (
        <>
          <div className="flex items-center gap-4">
            <TrackArt art={track.art} playing={playing} className="size-20" />
            <div className="min-w-0">
              <p className="text-sm text-ink-muted">{track.artist}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={onTogglePlay} className="btn btn-primary px-4 py-2 text-[13px]">
                  {playing ? <Pause aria-hidden className="size-4" fill="currentColor" /> : <Play aria-hidden className="size-4" fill="currentColor" />}
                  {playing ? 'Jeda' : 'Putar'}
                </button>
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  aria-pressed={favorite}
                  className="btn btn-ghost px-4 py-2 text-[13px]"
                >
                  <Heart aria-hidden className={`size-4 ${favorite ? 'text-live' : ''}`} fill={favorite ? 'currentColor' : 'none'} />
                  {favorite ? 'Favorit' : 'Favoritkan'}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">{track.about}</p>

          <dl className="mt-4 grid grid-cols-2 gap-2">
            {facts.map(([label, value]) => (
              <div key={label} className="glass-inset p-3">
                <dt className="text-xs text-ink-dim">{label}</dt>
                <dd className="mt-0.5 text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-xs leading-relaxed text-ink-dim">
            {track.src
              ? 'Diputar dari file audio.'
              : 'Musik original yang disintesis langsung di browser kamu, jadi tidak ada file yang diunduh.'}
          </p>
        </>
      )}
    </Modal>
  );
}

function PanelSection({ title, body, children }) {
  return (
    <section className="music-panel__section">
      <h3 className="font-display text-[15px] font-bold text-ink">{title}</h3>
      {body && <p className="mt-0.5 text-xs text-ink-dim">{body}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * The coding playlist as a floating button at the bottom right of the landing page,
 * lined up with the nav bar's call to action. The panel it opens stays mounted while
 * closed, so music keeps playing after it is closed.
 */
export default function MusicDock() {
  const { notify } = useToast();
  const onError = useCallback(
    (error) => notify({ tone: 'error', title: 'Gagal memutar lagu', body: error.message }),
    [notify],
  );
  const { playing: trackPlaying, isPlaying, toggle: toggleTrack, pause: pauseTrack } = usePlaylistPlayer({ onError });
  const onVideoError = useCallback(
    (error) => notify({ tone: 'error', title: 'Gagal memutar video', body: error.message }),
    [notify],
  );

  // One sound at a time: the featured video, the searched songs and the original tracks pause each other.
  const pauseOthersRef = useRef({});
  const youtube = useYouTubePlayer({ onPlay: () => pauseOthersRef.current.youtube(), onError: onVideoError });
  const songs = useSongPlayer({ onPlay: () => pauseOthersRef.current.songs(), onNotice: notify });
  pauseOthersRef.current = {
    youtube: () => {
      pauseTrack();
      songs.pause();
    },
    songs: () => {
      pauseTrack();
      youtube.pause();
    },
  };
  const toggle = (track) => {
    if (!isPlaying(track.id)) {
      youtube.pause();
      songs.pause();
    }
    toggleTrack(track);
  };
  const { isFavorite, toggleFavorite } = useFavoriteTracks();
  const [infoId, setInfoId] = useState(null);
  const info = TRACKS.find(({ id }) => id === infoId) ?? null;

  const [open, setOpen] = useState(false);
  const dockRef = useRef(null);
  const buttonRef = useRef(null);
  const anythingPlaying = trackPlaying || youtube.status === 'playing' || songs.status === 'playing';

  // Escape or a click elsewhere on the page closes the panel. A dialog opened from the
  // panel (track info) handles its own Escape, so the panel stays open behind it.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!dockRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      setOpen(false);
      buttonRef.current.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={dockRef} className="music-dock page-shell">
      {/* The searched song plays here, out of sight, so it keeps going while the panel is closed. */}
      <div ref={songs.containerRef} aria-hidden inert className="song-player-host [&>iframe]:size-full" />
      <div
        id="music-panel"
        role="dialog"
        aria-labelledby="music-panel-title"
        data-open={open}
        inert={!open}
        className="music-panel glass-raised"
      >
        <div className="music-panel__head">
          <span className="icon-chip icon-chip--live">
            <Music aria-hidden className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="music-panel-title" className="font-display text-base font-bold text-ink">
              Playlist ngoding
            </h2>
            <p className="truncate text-xs text-ink-dim">Tetap diputar saat panel ditutup.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              buttonRef.current.focus();
            }}
            aria-label="Tutup playlist"
            className="icon-btn"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <div className="music-panel__body">
          <PanelSection title="Pilihan kami">
            <FeaturedSong player={youtube} />
          </PanelSection>

          <PanelSection title="Cari lagu lain" body="Putar lagu lengkapnya, sampai selesai.">
            <SongSearch player={songs} />
          </PanelSection>

          <PanelSection title="Musik original" body="Disintesis langsung di browser kamu, tanpa iklan dan tanpa unduhan.">
            <ul className="grid gap-2">
              {TRACKS.map((track) => (
                <li key={track.id} className="min-w-0">
                  <TrackCard
                    track={track}
                    playing={isPlaying(track.id)}
                    favorite={isFavorite(track.id)}
                    onTogglePlay={() => toggle(track)}
                    onToggleFavorite={() => toggleFavorite(track.id)}
                    onInfo={() => setInfoId(track.id)}
                  />
                </li>
              ))}
            </ul>
          </PanelSection>
        </div>

        <TrackDetails
          track={info}
          playing={info ? isPlaying(info.id) : false}
          favorite={info ? isFavorite(info.id) : false}
          onTogglePlay={() => toggle(info)}
          onToggleFavorite={() => toggleFavorite(info.id)}
          onClose={() => setInfoId(null)}
        />
      </div>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="music-panel"
        aria-label={open ? 'Tutup playlist ngoding' : 'Buka playlist ngoding'}
        title="Playlist ngoding"
        data-playing={anythingPlaying}
        className="music-fab"
      >
        {open ? (
          <X aria-hidden className="size-6" />
        ) : anythingPlaying ? (
          <span className="music-fab__eq">
            <Equalizer />
          </span>
        ) : (
          <Music aria-hidden className="size-6" />
        )}
      </button>
    </div>
  );
}
