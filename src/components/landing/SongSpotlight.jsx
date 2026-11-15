import { useState } from 'react';
import { LoaderCircle, Pause, Play, Search, SearchX, TriangleAlert, X } from 'lucide-react';
import { FEATURED_SONG } from '../../content/playlist';
import { useSongSearch } from '../../hooks/useSongSearch';

const SUGGESTIONS = ['Tulus', 'Hindia', 'Nadin Amizah', 'Lo-fi'];

export function Equalizer() {
  return (
    <span aria-hidden className="inline-flex h-3 items-end gap-[2px]">
      {[0, 1, 2].map((bar) => (
        <span key={bar} className="song-eq-bar" style={{ animationDelay: `${bar * -0.3}s` }} />
      ))}
    </span>
  );
}

const STATUS_TEXT = { idle: 'Siap diputar', loading: 'Memuat…', playing: 'Sedang diputar', paused: 'Dijeda', ended: 'Selesai diputar' };

/** The featured song's video. Until someone presses play it is only a thumbnail, so YouTube loads nothing. */
export function FeaturedSong({ player, song = FEATURED_SONG }) {
  const { containerRef, status, started, play } = player;

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        <div ref={containerRef} className="absolute inset-0 [&>iframe]:size-full" />

        {!started && (
          <button
            type="button"
            onClick={() => play(song)}
            aria-label={`Putar ${song.title} oleh ${song.channel}`}
            className="song-facade group absolute inset-0"
          >
            <img
              src={`https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
              alt=""
              width="480"
              height="360"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
            <span className="song-play-btn absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Play aria-hidden className="size-6 translate-x-0.5 sm:size-7" fill="currentColor" />
            </span>
            <span className="absolute inset-x-0 bottom-0 p-3.5 text-left">
              <span className="badge-featured">Lagu utama</span>
              <span className="mt-1.5 block font-display text-xl font-extrabold leading-tight text-white">
                {song.title}
              </span>
              <span className="block text-sm text-white/75">
                {song.channel} · {song.label}
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="mt-2.5 px-0.5" aria-live="polite">
        <p className="flex items-center gap-2 text-xs font-medium text-ink-dim">
          {status === 'playing' && <Equalizer />}
          {status === 'loading' && <LoaderCircle aria-hidden className="size-3.5 animate-spin" />}
          {STATUS_TEXT[status]}
        </p>
        <p className="truncate text-[15px] font-semibold text-ink">
          {song.title}
          <span className="font-normal text-ink-muted"> · {song.channel}</span>
        </p>
      </div>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <ul aria-hidden className="space-y-1.5">
      {[0, 1, 2, 3].map((row) => (
        <li key={row} className="flex items-center gap-3 p-1.5">
          <span className="size-14 shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
            <span className="block h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** 3:07, or 1:02:03 for anything an hour or longer. */
export function formatTime(seconds = 0) {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

const ROW_STATUS = {
  finding: 'Mencari lagu lengkap…',
  loading: 'Memuat…',
};

/** One search result. The whole row is one button that plays the full song or pauses it. */
function SongResult({ song, player }) {
  const active = player.isActive(song.id);
  const playing = active && player.status === 'playing';
  const busy = active && (player.status === 'finding' || player.status === 'loading');
  const Icon = busy ? LoaderCircle : playing ? Pause : Play;
  const { current, duration } = active ? player.time : { current: 0, duration: song.duration };
  const progress = duration ? Math.min(1, current / duration) : 0;
  const isPreview = active && player.source === 'preview';

  return (
    <li>
      <button
        type="button"
        onClick={() => player.toggle(song)}
        aria-label={`${playing || busy ? 'Jeda' : 'Putar'} ${song.title} oleh ${song.artist}`}
        data-active={active}
        className="song-result w-full text-left"
      >
        <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
          {song.artwork && (
            <img src={song.artwork} alt="" width="200" height="200" loading="lazy" decoding="async" className="size-full object-cover" />
          )}
          {playing && (
            <span className="absolute inset-0 grid place-items-center bg-black/45">
              <Equalizer />
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{song.title}</span>
          <span className="mt-0.5 block truncate text-xs text-ink-dim">
            {song.artist}
            {song.album ? ` · ${song.album}` : ''}
          </span>
          {active && (
            <span className="mt-1.5 block">
              {busy && !current ? (
                <span className="block text-[11px] text-ink-dim">{ROW_STATUS[player.status]}</span>
              ) : (
                <span className="flex items-center gap-2 text-[11px] tabular-nums text-ink-dim">
                  <span>{formatTime(current)}</span>
                  <span aria-hidden className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <span className="song-progress block h-full rounded-full bg-live" style={{ width: `${progress * 100}%` }} />
                  </span>
                  <span>{formatTime(duration)}</span>
                  {isPreview && <span className="text-cyber-soft">Pratinjau</span>}
                </span>
              )}
            </span>
          )}
        </span>

        {!active && duration > 0 && (
          <span className="shrink-0 text-xs tabular-nums text-ink-dim">{formatTime(duration)}</span>
        )}
        <span aria-hidden className="song-result-play">
          <Icon className={`size-4 ${busy ? 'animate-spin' : playing ? '' : 'translate-x-px'}`} fill={busy ? 'none' : 'currentColor'} />
        </span>
      </button>
    </li>
  );
}

/** Song search on iTunes, with each result playable in full in place. */
export function SongSearch({ player }) {
  const { status, query, items, error, search } = useSongSearch();
  const [text, setText] = useState('');

  const submit = (value) => {
    setText(value);
    search(value);
  };

  return (
    <div className="min-w-0">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          search(text);
        }}
        className="search-shell flex items-center gap-2 rounded-xl pl-3.5 pr-1.5"
      >
        <Search aria-hidden className="size-4 shrink-0 text-cyber-soft" />
        <label htmlFor="song-search" className="sr-only">
          Judul lagu atau nama artis
        </label>
        <input
          id="song-search"
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Judul lagu atau artis"
          maxLength={100}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          className="h-12 w-full min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-dim focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {text && (
          <button
            type="button"
            onClick={() => setText('')}
            aria-label="Hapus kata kunci"
            className="rounded-lg p-1.5 text-ink-muted hover:text-ink"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={!text.trim() || status === 'loading'}
          className="btn btn-primary shrink-0 px-4 py-2 text-[13px]"
        >
          Cari
        </button>
      </form>

      <p className="sr-only" aria-live="polite">
        {status === 'loading' && 'Mencari lagu…'}
        {status === 'done' && `${items.length} lagu ditemukan untuk ${query}.`}
      </p>

      <div className="mt-3">
        {status === 'idle' && (
          <div>
            <p className="text-xs text-ink-dim">Coba cari:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => submit(suggestion)} className="song-chip">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {status === 'loading' && <ResultSkeleton />}

        {status === 'error' && (
          <p role="alert" className="flex gap-2.5 rounded-xl border border-danger/30 bg-danger/[0.08] p-3 text-sm text-ink">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
            {error}
          </p>
        )}

        {status === 'done' && items.length === 0 && (
          <p className="flex items-center gap-2.5 text-sm text-ink-muted">
            <SearchX aria-hidden className="size-4 shrink-0" />
            Tidak ada lagu yang cocok dengan “{query}”.
          </p>
        )}

        {status === 'done' && items.length > 0 && (
          <ul className="song-results -mx-1.5 max-h-[18.5rem] space-y-0.5 overflow-y-auto pr-1">
            {items.map((song) => (
              <SongResult key={song.id} song={song} player={player} />
            ))}
          </ul>
        )}
      </div>

      {status !== 'idle' && (
        <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-ink-dim">
          Data lagu dari iTunes. Lagu lengkapnya diputar dari YouTube.
        </p>
      )}
    </div>
  );
}
