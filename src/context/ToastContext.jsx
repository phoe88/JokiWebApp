import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, chip: 'icon-chip--live' },
  info: { icon: Info, chip: 'icon-chip--cyber' },
  error: { icon: AlertTriangle, chip: 'icon-chip--danger' },
};

const TOAST_LIFETIME_MS = 8000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (toast) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current.slice(-2), { tone: 'info', ...toast, id }]);
      window.setTimeout(() => dismiss(id), TOAST_LIFETIME_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-[calc(var(--tabbar-height)+1.25rem+env(safe-area-inset-bottom))] right-3 z-50 flex w-[min(24rem,calc(100vw-1.5rem))] flex-col gap-2 lg:bottom-4 lg:right-4"
      >
        {toasts.map((toast) => {
          const tone = TONES[toast.tone];
          const Icon = tone.icon;
          return (
            <div
              key={toast.id}
              className="glass-raised animate__animated animate__fadeInUp animate__faster flex items-start gap-3 rounded-2xl p-3"
            >
              <span className={`icon-chip ${tone.chip}`}>
                <Icon aria-hidden className="size-4" />
              </span>
              <div className="min-w-0 flex-1 text-sm leading-snug">
                <p className="font-semibold text-ink">{toast.title}</p>
                {toast.body && <p className="mt-1 text-ink-muted">{toast.body}</p>}
                {toast.link && (
                  <Link
                    to={toast.link.to}
                    onClick={() => dismiss(toast.id)}
                    className="mt-1.5 inline-block rounded font-medium text-cyber-soft underline underline-offset-4"
                  >
                    {toast.link.label}
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-lg p-0.5 text-ink-muted hover:text-ink"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
