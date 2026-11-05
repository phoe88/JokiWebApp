import { useEffect, useRef, useState } from 'react';
import { KeyRound, LoaderCircle, MailCheck, ServerOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isDemoMode } from '../lib/SupabaseClient';

const MODES = [
  { id: 'signin', label: 'Sign In' },
  { id: 'signup', label: 'Sign Up' },
];

function DemoExplanation() {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold text-cyber-soft">
        <ServerOff aria-hidden className="size-4" />
        Supabase is not configured
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        This build is running in demo mode, so there is no account system to sign in to. To enable
        login, add these two values to a <code className="font-semibold text-ink">.env</code> file and
        restart the app:
      </p>
      <pre className="glass-inset mt-3 overflow-x-auto p-3 text-xs leading-relaxed text-live">
        VITE_SUPABASE_URL{'\n'}VITE_SUPABASE_ANON_KEY
      </pre>
    </div>
  );
}

function AuthForm({ reason, onDone }) {
  const { signIn, signUp } = useAuth();
  const { notify } = useToast();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signIn({ email: form.email.trim(), password: form.password });
      } else {
        const needsConfirmation = await signUp({
          email: form.email.trim(),
          password: form.password,
          username: form.username.trim(),
        });
        if (needsConfirmation) {
          setConfirmationSent(true);
          return;
        }
      }
      notify({
        tone: 'success',
        title: 'Session active',
        body: reason ? 'You are signed in. Select the service again to place the order.' : undefined,
      });
      onDone();
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSent) {
    return (
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-live">
          <MailCheck aria-hidden className="size-4" />
          Confirmation sent
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Open the link sent to <span className="text-ink">{form.email}</span> to activate your
          account, then sign in here.
        </p>
      </div>
    );
  }

  return (
    <>
      {reason && <p className="mb-4 text-sm text-cyber-soft">{reason}</p>}

      <div role="group" aria-label="Choose sign in or sign up" className="segment grid w-full grid-cols-2">
        {MODES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => {
              setMode(id);
              setError(null);
            }}
            className="pill text-center"
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        {mode === 'signup' && (
          <label className="block">
            <span className="text-[13px] font-medium text-ink-muted">Username (optional)</span>
            <input
              value={form.username}
              onChange={update('username')}
              autoComplete="username"
              maxLength={64}
              className="field mt-1 text-base sm:text-sm"
            />
          </label>
        )}
        <label className="block">
          <span className="text-[13px] font-medium text-ink-muted">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
            className="field mt-1 text-base sm:text-sm"
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-ink-muted">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update('password')}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            className="field mt-1 text-base sm:text-sm"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary mt-1 w-full">
          {submitting && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
          {mode === 'signin' ? 'Secure Login' : 'Create Account'}
        </button>
      </form>
    </>
  );
}

export default function LoginModal() {
  const { loginRequest, closeLogin } = useAuth();
  const dialogRef = useRef(null);
  const open = Boolean(loginRequest);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
      // React's autoFocus runs while the dialog is still closed, so it has no effect here.
      dialog.querySelector('input[type="email"]')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="login-title"
      onClose={closeLogin}
      onClick={(event) => {
        if (event.target === dialogRef.current) closeLogin();
      }}
      className="dialog"
    >
      {open && (
        <div className="glass-raised animate__animated animate__fadeInUp animate__faster p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 id="login-title" className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
              <span className="icon-chip icon-chip--cyber">
                <KeyRound aria-hidden className="size-4" />
              </span>
              Secure Login
            </h2>
            <button type="button" onClick={closeLogin} aria-label="Close" className="icon-btn">
              <X aria-hidden className="size-4" />
            </button>
          </div>
          {isDemoMode ? <DemoExplanation /> : <AuthForm reason={loginRequest.reason} onDone={closeLogin} />}
        </div>
      )}
    </dialog>
  );
}
