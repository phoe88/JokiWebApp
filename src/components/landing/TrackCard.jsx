import { Heart, MicVocal, Pause, Play } from 'lucide-react';
import TrackArt from './TrackArt';

/** One playlist row: cover, title and artist, then info, favourite and play controls. */
export default function TrackCard({ track, playing, favorite, onTogglePlay, onToggleFavorite, onInfo }) {
  return (
    <article
      aria-label={`${track.title} oleh ${track.artist}`}
      data-playing={playing}
      style={{ '--tone': track.tone }}
      className="track-card"
    >
      <TrackArt art={track.art} playing={playing} />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold leading-snug text-white">{track.title}</h3>
        <p className="truncate text-sm text-white/60">{track.artist}</p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button type="button" onClick={onInfo} aria-label={`Info lagu ${track.title}`} title="Info lagu" className="track-btn">
          <MicVocal aria-hidden className="size-[1.125rem]" />
        </button>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={favorite}
          aria-label={`Favoritkan ${track.title}`}
          title={favorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          className="track-btn track-btn--fav"
        >
          <Heart aria-hidden className="size-[1.125rem]" fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={playing ? `Jeda ${track.title}` : `Putar ${track.title}`}
          title={playing ? 'Jeda' : 'Putar'}
          className="track-btn track-btn--play"
        >
          {playing ? (
            <Pause aria-hidden className="size-[1.125rem]" fill="currentColor" />
          ) : (
            <Play aria-hidden className="size-[1.125rem]" fill="currentColor" />
          )}
        </button>
      </div>
    </article>
  );
}
