import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { BANNER, completeInput, runCommand } from '../lib/terminalCommands';
import { isDemoMode } from '../lib/SupabaseClient';
import { fetchMyOrders } from '../services/orders';

const TONE_CLASS = {
  cmd: 'text-cyber-soft',
  out: 'text-ink',
  ok: 'text-live',
  warn: 'text-cyber-soft',
  err: 'text-danger',
  dim: 'text-ink-muted',
};

const PROMPT = 'guest@joki:~$';

export default function Terminal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services } = useCatalog();

  const [lines, setLines] = useState(BANNER);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(null);
  const [running, setRunning] = useState(false);

  const inputRef = useRef(null);
  const outputRef = useRef(null);

  const prompt = user ? PROMPT.replace('guest', user.email.split('@')[0]) : PROMPT;

  useEffect(() => {
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  const submit = async (event) => {
    event.preventDefault();
    if (running) return;
    const command = input.trim();
    setInput('');
    setHistoryIndex(null);

    const echo = { tone: 'cmd', text: `${prompt} ${command}` };
    if (!command) {
      setLines((current) => [...current, echo]);
      return;
    }

    setHistory((current) => [...current, command]);
    setRunning(true);

    const result = await runCommand(command, {
      demo: isDemoMode,
      user,
      catalog: services,
      loadOrders: () => fetchMyOrders(user.id),
    });

    setRunning(false);
    setLines((current) => (result.clear ? [] : [...current, echo, ...result.lines]));
    inputRef.current?.focus();
    if (result.navigate) navigate(result.navigate);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Tab' && input.trim()) {
      const completed = completeInput(input);
      if (completed !== input) {
        event.preventDefault();
        setInput(completed);
      }
      return;
    }

    if (event.key === 'ArrowUp' && history.length > 0) {
      event.preventDefault();
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(history[next]);
    }

    if (event.key === 'ArrowDown' && historyIndex !== null) {
      event.preventDefault();
      const next = historyIndex + 1;
      setHistoryIndex(next < history.length ? next : null);
      setInput(next < history.length ? history[next] : '');
    }
  };

  return (
    <div className="pt-6">
      <PageHeader
        eyebrow="Console"
        title="Terminal"
        description="A browser-only pseudo-terminal for finding your way around. Nothing typed here runs on a real machine."
      />

      <section
        aria-label="Pseudo-terminal"
        onClick={() => {
          if (!window.getSelection()?.toString()) inputRef.current?.focus();
        }}
        className="glass animate__animated animate__fadeInUp animate__faster mt-5 flex h-[34rem] max-h-[68dvh] min-h-[20rem] flex-col"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-cyber-deep" />
            <span className="size-2.5 rounded-full bg-cyber" />
            <span className="size-2.5 rounded-full bg-live" />
          </span>
          <span className="font-mono text-xs text-ink-muted">joki_shell</span>
        </div>

        <div
          ref={outputRef}
          role="log"
          aria-live="polite"
          tabIndex={0}
          aria-label="Terminal output"
          className="min-h-0 flex-1 overflow-y-auto rounded-xl p-5 font-mono text-sm leading-relaxed"
        >
          {lines.map((line, index) => (
            <p
              // Lines only ever append or clear, so the index is stable.
              key={index}
              className={`whitespace-pre-wrap break-words ${TONE_CLASS[line.tone]}`}
            >
              {line.text}
            </p>
          ))}
        </div>

        <form
          onSubmit={submit}
          className="terminal-prompt flex items-center gap-2 border-t border-white/10 px-5 py-3.5 font-mono text-sm"
        >
          <label htmlFor="terminal-input" className="max-w-[45%] shrink-0 truncate text-live">
            {prompt}
          </label>
          <input
            ref={inputRef}
            id="terminal-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            readOnly={running}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            className="terminal-input text-base sm:text-sm"
          />
        </form>
      </section>
    </div>
  );
}
