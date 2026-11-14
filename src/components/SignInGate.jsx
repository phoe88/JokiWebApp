import { LockKeyhole, LogIn } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notice from './Notice';

/** Shown in place of a page that needs an account. */
export default function SignInGate({ title = 'Masuk untuk melanjutkan', body }) {
  const { openLogin } = useAuth();
  const { pathname } = useLocation();

  return (
    <Notice
      icon={LockKeyhole}
      title={title}
      body={body}
      action={
        <button type="button" onClick={() => openLogin(null, pathname)} className="btn btn-primary mt-6">
          <LogIn aria-hidden className="size-4" />
          Masuk atau Daftar
        </button>
      }
    />
  );
}
