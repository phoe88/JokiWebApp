import { useEffect, useRef, useState } from 'react';
import { CheckCheck, Code2, CodeXml, LoaderCircle } from 'lucide-react';
import { APP_NAME } from '../../config/brand';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const TYPE_MS = 34;
const ticks = (ms) => Math.round(ms / TYPE_MS);

/** After the code is typed: a pause, the logo glitching in and holding, then a quick glitch out. */
const PAUSE_TICKS = ticks(2000);
const LOGO_TICKS = ticks(2000 + 3200);
const LOGO_OUT_TICKS = ticks(450);

const TONE = {
  kw: 'text-cyber',
  fn: 'text-live',
  str: 'text-[#b8f5a0]',
  com: 'text-ink-dim',
  id: 'text-ink',
  op: 'text-ink-muted',
};

const CODE = [
  [['kw', 'const '], ['id', 'project'], ['op', ' = '], ['fn', 'createProject'], ['op', '({']],
  [['id', '  client'], ['op', ': '], ['str', "'kamu'"], ['op', ',']],
  [['id', '  stack'], ['op', ': ['], ['str', "'React'"], ['op', ', '], ['str', "'Supabase'"], ['op', '],']],
  [['id', '  kode'], ['op', ': '], ['str', "'bersih'"], ['op', ',']],
  [['op', '});']],
  [],
  [['kw', 'await '], ['id', 'project'], ['op', '.'], ['fn', 'build'], ['op', '();']],
  [['kw', 'await '], ['id', 'project'], ['op', '.'], ['fn', 'test'], ['op', '();']],
  [['kw', 'await '], ['id', 'project'], ['op', '.'], ['fn', 'deploy'], ['op', '();']],
  [],
  [['com', '// siap dipakai']],
];

/** One tick per character, plus one for each line break. */
const TOTAL = CODE.reduce((sum, row) => sum + row.reduce((n, [, text]) => n + text.length, 0) + 1, 0);

function CodeLines({ typed, showCaret }) {
  let budget = typed;

  return CODE.map((row, rowIndex) => {
    const started = budget > 0;
    const parts = row.map(([tone, text], index) => {
      const visible = text.slice(0, Math.max(budget, 0));
      budget -= text.length;
      return (
        <span key={index} className={TONE[tone]}>
          {visible}
        </span>
      );
    });
    budget -= 1;
    const caretHere = showCaret && started && budget <= 0;

    return (
      // Rows are fixed, so the index is stable. Each keeps its height to hold the window still.
      <div key={rowIndex} className="flex min-h-[1.7em]">
        <span aria-hidden className="w-7 shrink-0 select-none text-ink-dim/60">
          {rowIndex + 1}
        </span>
        <span className="whitespace-pre">
          {parts}
          {caretHere && <span className="type-caret" />}
        </span>
      </div>
    );
  });
}

const CYCLE = TOTAL + PAUSE_TICKS + LOGO_TICKS + LOGO_OUT_TICKS;

function phaseAt(tick) {
  if (tick < TOTAL) return 'typing';
  if (tick < TOTAL + PAUSE_TICKS) return 'done';
  if (tick < TOTAL + PAUSE_TICKS + LOGO_TICKS) return 'logo';
  return 'logo-out';
}

function LogoMark() {
  return (
    <>
      <span className="glitch-logo__chip">
        <CodeXml className="size-12 sm:size-14" strokeWidth={2.25} />
      </span>
      <span className="glitch-logo__word">
        {APP_NAME}
        <span className="glitch-logo__dot" />
      </span>
    </>
  );
}

/**
 * The JokiWebApp logo in green, assembled from glitching slices. The main layer
 * reveals band by band while two offset ghost copies flicker and fade.
 */
function GlitchLogo({ leaving }) {
  return (
    <div aria-hidden className={`glitch-logo ${leaving ? 'glitch-logo--out' : ''}`}>
      <div className="glitch-logo__layer glitch-logo__layer--ghost-a">
        <LogoMark />
      </div>
      <div className="glitch-logo__layer glitch-logo__layer--ghost-b">
        <LogoMark />
      </div>
      <div className="glitch-logo__layer glitch-logo__layer--main">
        <LogoMark />
      </div>
      <span className="glitch-logo__scan" />
    </div>
  );
}

function CodePanel() {
  const reducedMotion = usePrefersReducedMotion();
  const [typed, setTyped] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return undefined;

    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(panelRef.current);

    const interval = window.setInterval(() => {
      if (!visible || document.hidden) return;
      setTyped((current) => (current >= CYCLE ? 0 : current + 1));
    }, TYPE_MS);

    return () => {
      window.clearInterval(interval);
      observer.disconnect();
    };
  }, [reducedMotion]);

  const shown = reducedMotion ? TOTAL : typed;
  const done = shown >= TOTAL;
  const phase = reducedMotion ? 'done' : phaseAt(shown);
  const logoShown = phase === 'logo' || phase === 'logo-out';

  return (
    <div ref={panelRef}>
      <p className="sr-only">Contoh potongan kode yang membuat, menguji, dan men-deploy sebuah project.</p>
      <div className="relative">
        <div
          aria-hidden
          className={`no-scrollbar overflow-x-auto p-4 font-mono text-[11.5px] leading-[1.7] sm:p-5 sm:text-[13px] ${
            logoShown ? 'code-glitch-out' : ''
          }`}
        >
          <CodeLines typed={shown} showCaret={!done} />
        </div>
        {logoShown && <GlitchLogo leaving={phase === 'logo-out'} />}
      </div>
      <p aria-hidden className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5 font-mono text-xs text-ink-muted sm:px-5">
        {done ? (
          <>
            <CheckCheck className="size-3.5 text-live" />
            build selesai
          </>
        ) : (
          <>
            <LoaderCircle className="size-3.5 animate-spin text-cyber" />
            sedang dikerjakan
          </>
        )}
      </p>
    </div>
  );
}

/** The hero visual: code that types itself out, then reports the build as done. */
export default function CodeWindow() {
  return (
    <div className="neon-frame">
      <div className="neon-frame__ring">
        <div className="neon-frame__body">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
            <span aria-hidden className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-cyber/70" />
              <span className="size-2.5 rounded-full bg-live" />
            </span>
            <p className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs text-ink">
              <Code2 aria-hidden className="size-3.5" />
              project.js
            </p>
          </div>
          <CodePanel />
        </div>
      </div>
    </div>
  );
}
