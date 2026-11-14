import { LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

/** Up to two letters from the part of the address before the @. */
export function initialsOf(email = '') {
  const parts = email.split('@')[0].split(/[._+-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? '?').slice(0, 2);
  return letters.toUpperCase();
}

/** The name to greet someone by: their username, or the start of their email. */
export function displayNameOf(user) {
  return user?.user_metadata?.username || user?.email?.split('@')[0] || '';
}

function Avatar({ email }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-live/15 text-xs font-bold text-live ring-1 ring-live/30"
    >
      {initialsOf(email)}
    </span>
  );
}

function useSignOut() {
  const { signOut } = useAuth();
  const { notify } = useToast();

  return async () => {
    try {
      await signOut();
      notify({ tone: 'success', title: 'Berhasil keluar' });
    } catch (error) {
      notify({ tone: 'error', title: 'Gagal keluar', body: error.message });
    }
  };
}

/**
 * The navbar's login control: a sign-in button, or the account and sign out.
 * `block` lays it out full width for the mobile drawer.
 */
export default function AccountControl({ block = false, onAction }) {
  const { user, loading, openLogin } = useAuth();
  const handleSignOut = useSignOut();

  if (loading) {
    return <span aria-hidden className={block ? 'h-11' : 'w-[5.5rem]'} />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => {
          onAction?.();
          openLogin();
        }}
        className={`btn btn-ghost ${block ? 'w-full' : 'px-4 py-2'}`}
      >
        <LogIn aria-hidden className="size-4" />
        Masuk
      </button>
    );
  }

  return (
    <div className={`flex min-w-0 items-center gap-2 ${block ? 'glass-inset justify-between p-2 pl-3' : ''}`}>
      <span title={user.email} className="flex min-w-0 items-center gap-2.5">
        <Avatar email={user.email} />
        <span className="sr-only">Masuk sebagai </span>
        <span className={`min-w-0 truncate text-sm text-ink-muted ${block ? '' : 'sr-only'}`}>{user.email}</span>
      </span>
      <button type="button" onClick={handleSignOut} aria-label="Keluar" title="Keluar" className="icon-btn">
        <LogOut aria-hidden className="size-4" />
      </button>
    </div>
  );
}
