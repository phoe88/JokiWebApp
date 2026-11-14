import { useCallback, useState } from 'react';
import { Heart, Music, Pause, Play } from 'lucide-react';
import { TRACKS } from '../../content/playlist';
import { useToast } from '../../context/ToastContext';
import { useFavoriteTracks, usePlaylistPlayer } from '../../hooks/usePlaylistPlayer';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import Modal from '../Modal';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import SongSpotlight from './SongSpotlight';
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

export default function PlaylistSection() {
  const { notify } = useToast();
  const onError = useCallback(
    (error) => notify({ tone: 'error', title: 'Gagal memutar lagu', body: error.message }),
    [notify],
  );
  const { isPlaying, toggle: toggleTrack, pause: pauseTrack } = usePlaylistPlayer({ onError });
  // One sound at a time: the YouTube player and the original tracks pause each other.
  const onVideoError = useCallback(
    (error) => notify({ tone: 'error', title: 'Gagal memutar video', body: error.message }),
    [notify],
  );
  const youtube = useYouTubePlayer({ onPlay: pauseTrack, onError: onVideoError });
  const toggle = (track) => {
    if (!isPlaying(track.id)) youtube.pause();
    toggleTrack(track);
  };
  const { isFavorite, toggleFavorite } = useFavoriteTracks();
  const [infoId, setInfoId] = useState(null);
  const info = TRACKS.find(({ id }) => id === infoId) ?? null;

  return (
    <section id="playlist" aria-labelledby="playlist-title" className="page-shell scroll-mt-28 py-20 lg:py-24">
      <SectionHeading
        title={<span id="playlist-title">Playlist ngoding</span>}
        body="Mulai dari lagu utama pilihan kami, cari lagu favoritmu dari YouTube, atau pakai musik original yang diputar langsung di browser."
      />

      <SongSpotlight player={youtube} />

      <div className="mt-12 max-w-2xl">
        <h3 className="font-display text-xl font-bold text-ink">Musik original</h3>
        <p className="mt-1 text-sm text-ink-muted">Disintesis langsung di browser kamu, tanpa iklan dan tanpa unduhan.</p>
      </div>

      <Reveal as="ul" className="mt-5 grid gap-3 md:grid-cols-2">
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
      </Reveal>

      <TrackDetails
        track={info}
        playing={info ? isPlaying(info.id) : false}
        favorite={info ? isFavorite(info.id) : false}
        onTogglePlay={() => toggle(info)}
        onToggleFavorite={() => toggleFavorite(info.id)}
        onClose={() => setInfoId(null)}
      />
    </section>
  );
}
