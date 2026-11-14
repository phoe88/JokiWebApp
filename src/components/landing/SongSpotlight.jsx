import { useState } from 'react';
import { ExternalLink, LoaderCircle, Pause, Play, Search, SearchX, TriangleAlert, X } from 'lucide-react';
import { FEATURED_SONG } from '../../content/playlist';
import { useSongSearch } from '../../hooks/useSongSearch';

const SUGGESTIONS = ['Tulus', 'Hindia', 'Nadin Amizah', 'Lo-fi'];

function Equalizer() {
  return (
    <span aria-hidden className="inline-flex h-3 items-end gap-[2px]">
      {[0, 1, 2].map((bar) => (
        <span key={bar} className="song-eq-bar" style={{ animationDelay: `${bar * -0.3}s` }} />
      ))}
    </span>
  );
}

const STATUS_TEXT = { idle: 'Lagu utama', loading: 'Memuat…', playing: 'Sedang diputar', paused: 'Dijeda' };

/** The featured song's video. Until someone presses play it is only a thumbnail, so YouTube loads nothing. */
function SongPlayer({ player, song }) {
  const { containerRef, status, started, play } = player;

  return (
    <div className="glass overflow-hidden p-3 sm:p-4">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
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
            <span className="absolute inset-x-0 bottom-0 p-4 text-left sm:p-5">
              <span className="badge-featured">Lagu utama</span>
              <span className="mt-2 block font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                {song.title}
              </span>
              <span className="block text-sm text-white/75">
                {song.channel} · {song.label}
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="mt-3 px-1" aria-live="polite">
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

/** One search result: the artwork and names play the preview, the link opens Apple Music. */
function SongResult({ song, preview }) {
  const active = preview.isActive(song.id);
  const playing = active && preview.status === 'playing';
  const loading = active && preview.status === 'loading';
  const Icon = loading ? LoaderCircle : playing ? Pause : Play;

  return (
    <li className="song-result" data-active={active}>
      <button
        type="button"
        onClick={() => preview.toggle(song)}
        aria-label={`${playing || loading ? 'Jeda' : 'Putar'} pratinjau ${song.title} oleh ${song.artist}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5 text-left"
      >
        <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
          {song.artwork && (
            <img src={song.artwork} alt="" width="200" height="200" loading="lazy" decoding="async" className="size-full object-cover" />
          )}
          <span className="song-result-overlay absolute inset-0 grid place-items-center bg-black/50 text-white">
            <Icon aria-hidden className={`size-5 ${loading ? 'animate-spin' : ''}`} fill={loading ? 'none' : 'currentColor'} />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            {playing && <Equalizer />}
            <span className="truncate text-sm font-medium text-ink">{song.title}</span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-ink-dim">
            {song.artist}
            {song.album ? ` · ${song.album}` : ''}
          </span>
          {active && (
            <span aria-hidden className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-live" style={{ width: `${preview.progress * 100}%` }} />
            </span>
          )}
        </span>
      </button>
      {song.storeUrl && (
        <a
          href={song.storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Dengarkan ${song.title} di Apple Music (tab baru)`}
          className="song-store"
        >
          <span className="hidden sm:inline">Apple Music</span>
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      )}
    </li>
  );
}

/** Song search on iTunes, with each result's 30-second preview playable in place. */
function SongSearch({ preview }) {
  const { status, query, items, error, search } = useSongSearch();
  const [text, setText] = useState('');

  const submit = (value) => {
    setText(value);
    search(value);
  };

  return (
    <div className="glass flex min-w-0 flex-col p-4 sm:p-5">
      <h3 className="font-display text-lg font-bold text-ink">Cari lagu lain</h3>
      <p className="mt-1 text-sm text-ink-muted">Cari dari iTunes dan dengarkan pratinjau 30 detiknya.</p>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          search(text);
        }}
        className="search-shell mt-4 flex items-center gap-2 rounded-xl pl-3.5 pr-1.5"
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

      <div className="mt-4 min-h-0 flex-1">
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
          <ul className="song-results -mx-1.5 max-h-[22rem] space-y-0.5 overflow-y-auto pr-1">
            {items.map((song) => (
              <SongResult key={song.id} song={song} preview={preview} />
            ))}
          </ul>
        )}
      </div>

      {status !== 'idle' && (
        <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-ink-dim">
          Pratinjau 30 detik disediakan oleh iTunes. Lagu lengkapnya ada di Apple Music.
        </p>
      )}
    </div>
  );
}

/** The featured YouTube song beside a song search with iTunes previews. */
export default function SongSpotlight({ player, preview }) {
  return (
    <div className="mt-10 grid items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <SongPlayer player={player} song={FEATURED_SONG} />
      <SongSearch preview={preview} />
    </div>
  );
}
