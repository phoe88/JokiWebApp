import { useRef, useState } from 'react';
import { LoaderCircle, Play, Search, SearchX, TriangleAlert, Undo2, X } from 'lucide-react';
import { FEATURED_SONG } from '../../content/playlist';
import { useYouTubeSearch } from '../../hooks/useYouTubeSearch';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const SUGGESTIONS = ['Tulus', 'Hindia', 'Nadin Amizah', 'Lo-fi Indonesia'];

const thumbnailOf = (videoId) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

function Equalizer() {
  return (
    <span aria-hidden className="inline-flex h-3 items-end gap-[2px]">
      {[0, 1, 2].map((bar) => (
        <span key={bar} className="song-eq-bar" style={{ animationDelay: `${bar * -0.3}s` }} />
      ))}
    </span>
  );
}

/** The video area. Until someone presses play it is only a thumbnail, so YouTube loads nothing. */
function SongPlayer({ player, featured, onBackToFeatured }) {
  const { containerRef, video, status, started, play } = player;
  const current = video ?? featured;
  const isFeatured = current.videoId === featured.videoId;

  return (
    <div className="glass overflow-hidden p-3 sm:p-4">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
        <div ref={containerRef} className="absolute inset-0 [&>iframe]:size-full" />

        {!started && (
          <button
            type="button"
            onClick={() => play(featured)}
            aria-label={`Putar ${featured.title} oleh ${featured.channel}`}
            className="song-facade group absolute inset-0"
          >
            <img
              src={thumbnailOf(featured.videoId)}
              alt=""
              width="480"
              height="360"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
            <span className="song-play-btn absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Play aria-hidden className="size-7 translate-x-0.5" fill="currentColor" />
            </span>
            <span className="absolute inset-x-0 bottom-0 p-4 text-left sm:p-5">
              <span className="badge-featured">Lagu utama</span>
              <span className="mt-2 block font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                {featured.title}
              </span>
              <span className="block text-sm text-white/75">
                {featured.channel} · {featured.label}
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="mt-3 flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="flex items-center gap-2 text-xs font-medium text-ink-dim">
            {status === 'playing' && <Equalizer />}
            {status === 'loading' && <LoaderCircle aria-hidden className="size-3.5 animate-spin" />}
            {!started ? 'Lagu utama' : status === 'playing' ? 'Sedang diputar' : status === 'loading' ? 'Memuat…' : 'Dijeda'}
          </p>
          <p className="truncate text-[15px] font-semibold text-ink">
            {current.title}
            <span className="font-normal text-ink-muted"> · {current.channel}</span>
          </p>
        </div>
        {started && !isFeatured && (
          <button type="button" onClick={onBackToFeatured} className="btn btn-ghost shrink-0 px-3.5 py-2 text-[13px]">
            <Undo2 aria-hidden className="size-4" />
            Kembali ke {featured.title}
          </button>
        )}
      </div>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <ul aria-hidden className="space-y-1.5">
      {[0, 1, 2, 3].map((row) => (
        <li key={row} className="flex items-center gap-3 p-1.5">
          <span className="aspect-video w-28 shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-4/5 animate-pulse rounded bg-white/[0.06]" />
            <span className="block h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Song search. It searches on submit only, because every search spends YouTube API quota. */
function SongSearch({ currentId, playingNow, onPick }) {
  const { status, query, items, error, search } = useYouTubeSearch();
  const [text, setText] = useState('');

  const submit = (value) => {
    setText(value);
    search(value);
  };

  return (
    <div className="glass flex min-w-0 flex-col p-4 sm:p-5">
      <h3 className="font-display text-lg font-bold text-ink">Cari lagu lain</h3>
      <p className="mt-1 text-sm text-ink-muted">Cari dari YouTube, lalu putar langsung di player.</p>

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
            {items.map((item) => {
              const active = item.videoId === currentId;
              return (
                <li key={item.videoId}>
                  <button
                    type="button"
                    onClick={() => onPick(item)}
                    aria-current={active || undefined}
                    className="song-result"
                  >
                    <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
                      <img
                        src={item.thumbnail}
                        alt=""
                        width="320"
                        height="180"
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover"
                      />
                      {active && playingNow && (
                        <span className="absolute inset-0 grid place-items-center bg-black/55">
                          <Equalizer />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-medium leading-snug text-ink">{item.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-ink-dim">{item.channel}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/** The featured YouTube song and a search for other songs, sharing one player. */
export default function SongSpotlight({ player }) {
  const playerRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const currentId = (player.video ?? FEATURED_SONG).videoId;

  const pick = (item) => {
    player.play(item);
    // On narrow screens the player is above the results, so bring it into view.
    if (window.matchMedia('(max-width: 1023px)').matches) {
      playerRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mt-10 grid items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <div ref={playerRef} className="scroll-mt-28">
        <SongPlayer player={player} featured={FEATURED_SONG} onBackToFeatured={() => player.play(FEATURED_SONG)} />
      </div>
      <SongSearch currentId={currentId} playingNow={player.status === 'playing'} onPick={pick} />
    </div>
  );
}
