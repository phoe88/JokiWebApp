import { useEffect, useRef, useState } from 'react';
import { CheckCheck, Code2, LayoutDashboard, LoaderCircle } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import ProjectMockup from './ProjectMockup';

const TYPE_MS = 34;
const HOLD_TICKS = 130;

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
      setTyped((current) => (current >= TOTAL + HOLD_TICKS ? 0 : current + 1));
    }, TYPE_MS);

    return () => {
      window.clearInterval(interval);
      observer.disconnect();
    };
  }, [reducedMotion]);

  const shown = reducedMotion ? TOTAL : typed;
  const done = shown >= TOTAL;

  return (
    <div ref={panelRef}>
      <p className="sr-only">Contoh potongan kode yang membuat, menguji, dan men-deploy sebuah project.</p>
      <div aria-hidden className="no-scrollbar overflow-x-auto p-4 font-mono text-[11.5px] leading-[1.7] sm:p-5 sm:text-[13px]">
        <CodeLines typed={shown} showCaret={!done} />
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

const TABS = [
  { id: 'code', label: 'project.js', icon: Code2 },
  { id: 'preview', label: 'preview', icon: LayoutDashboard },
];

/** The hero visual: typed code in one tab and a finished screen in the other. */
export default function CodeWindow() {
  const [tab, setTab] = useState('code');
  const tabRefs = useRef({});

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = tab === 'code' ? 'preview' : 'code';
    setTab(next);
    tabRefs.current[next]?.focus();
  };

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
            <div role="tablist" aria-label="Tampilan hero" className="flex gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  ref={(node) => {
                    tabRefs.current[id] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`hero-tab-${id}`}
                  aria-selected={tab === id}
                  aria-controls="hero-tabpanel"
                  tabIndex={tab === id ? 0 : -1}
                  onClick={() => setTab(id)}
                  onKeyDown={onKeyDown}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs ${
                    tab === id ? 'bg-white/10 text-ink' : 'text-ink-dim hover:text-ink'
                  }`}
                >
                  <Icon aria-hidden className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div id="hero-tabpanel" role="tabpanel" aria-labelledby={`hero-tab-${tab}`}>
            {tab === 'code' ? (
              <CodePanel />
            ) : (
              <div className="p-4 sm:p-5">
                <p className="sr-only">Contoh tampilan dashboard yang sudah jadi.</p>
                <ProjectMockup kind="dashboard" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
