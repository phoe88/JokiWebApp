import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, LoaderCircle, MailCheck, ServerOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isDemoMode } from '../lib/SupabaseClient';

const MODES = [
  { id: 'signin', label: 'Masuk' },
  { id: 'signup', label: 'Daftar' },
];

/** Supabase answers in English. These are the messages people actually hit. */
const AUTH_ERRORS = [
  [/invalid login credentials/i, 'Email atau password salah.'],
  [/email not confirmed/i, 'Email belum dikonfirmasi. Buka link yang dikirim ke email kamu dulu.'],
  [/already registered|already exists/i, 'Email ini sudah terdaftar. Silakan masuk.'],
  [/password should be at least/i, 'Password minimal 6 karakter.'],
  [/rate limit|too many requests|security purposes/i, 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'],
  [/unable to validate email|invalid email/i, 'Format email tidak valid.'],
  [/failed to fetch|network/i, 'Tidak bisa terhubung ke server. Periksa koneksi kamu.'],
];

function translateError(message = '') {
  return AUTH_ERRORS.find(([pattern]) => pattern.test(message))?.[1] ?? message;
}

function DemoExplanation() {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold text-cyber-soft">
        <ServerOff aria-hidden className="size-4" />
        Login belum tersedia
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Sistem akun belum terhubung di versi ini, jadi belum ada yang bisa dimasuki. Coba lagi nanti,
        atau hubungi kami lewat konsultasi.
      </p>
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
      notify({ tone: 'success', title: 'Berhasil masuk' });
      onDone();
    } catch (authError) {
      setError(translateError(authError.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSent) {
    return (
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-live">
          <MailCheck aria-hidden className="size-4" />
          Cek email kamu
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Buka link yang dikirim ke <span className="text-ink">{form.email}</span> untuk mengaktifkan
          akun, lalu masuk di sini.
        </p>
      </div>
    );
  }

  return (
    <>
      {reason && <p className="mb-4 text-sm text-cyber-soft">{reason}</p>}

      <div role="group" aria-label="Pilih masuk atau daftar" className="segment grid w-full grid-cols-2">
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
            <span className="text-[13px] font-medium text-ink-muted">Username (opsional)</span>
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
          {mode === 'signin' ? 'Masuk' : 'Buat Akun'}
        </button>
      </form>
    </>
  );
}

export default function LoginModal() {
  const { loginRequest, closeLogin } = useAuth();
  const navigate = useNavigate();
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

  const finish = () => {
    const next = loginRequest?.next;
    closeLogin();
    if (next) navigate(next);
  };

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
              Masuk ke JokiWebApp
            </h2>
            <button type="button" onClick={closeLogin} aria-label="Tutup" className="icon-btn">
              <X aria-hidden className="size-4" />
            </button>
          </div>
          {isDemoMode ? <DemoExplanation /> : <AuthForm reason={loginRequest.reason} onDone={finish} />}
        </div>
      )}
    </dialog>
  );
}
