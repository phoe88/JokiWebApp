import { KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

/** Up to two letters from the part of the address before the @. */
export function initialsOf(email = '') {
  const parts = email.split('@')[0].split(/[._+-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? '?').slice(0, 2);
  return letters.toUpperCase();
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
    } catch (error) {
      notify({ tone: 'error', title: 'Sign out failed', body: error.message });
    }
  };
}

/** The bottom of the sidebar: a labelled row from xl, icons alone on the rail. */
export function SidebarAccount() {
  const { user, loading, openLogin } = useAuth();
  const handleSignOut = useSignOut();

  if (loading) return null;

  if (!user) {
    return (
      <button type="button" onClick={() => openLogin()} className="nav-item w-full">
        <KeyRound aria-hidden className="size-5 shrink-0" />
        <span className="nav-label">Secure Login</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 xl:flex-row">
      <span title={user.email} className="flex min-w-0 flex-1 items-center gap-2.5">
        <Avatar email={user.email} />
        <span className="sr-only">Signed in as </span>
        <span className="hidden min-w-0 truncate text-sm text-ink-muted xl:block">{user.email}</span>
      </span>
      <button type="button" onClick={handleSignOut} aria-label="Sign out" title="Sign out" className="icon-btn">
        <LogOut aria-hidden className="size-4" />
      </button>
    </div>
  );
}

/** The header's auth control. Below lg it is the only one, so it also carries sign out. */
export function TopBarAccount() {
  const { user, loading, openLogin } = useAuth();
  const handleSignOut = useSignOut();

  if (loading) {
    return <span className="px-2 text-sm text-ink-dim">Checking session</span>;
  }

  if (!user) {
    return (
      <button type="button" onClick={() => openLogin()} className="btn btn-primary shrink-0 px-2.5 py-2 text-xs sm:px-4 sm:text-[13px]">
        <KeyRound aria-hidden className="hidden size-4 sm:block" />
        Secure Login
      </button>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span title={user.email} className="flex min-w-0 items-center gap-2">
        <span className="hidden min-w-0 max-w-[14rem] truncate text-sm text-ink-muted sm:block">{user.email}</span>
        <Avatar email={user.email} />
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Sign out"
        title="Sign out"
        className="icon-btn lg:hidden"
      >
        <LogOut aria-hidden className="size-4" />
      </button>
    </div>
  );
}
