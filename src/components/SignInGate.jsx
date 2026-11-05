import { KeyRound, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Notice from './Notice';

export default function SignInGate({ body }) {
  const { openLogin } = useAuth();
  return (
    <Notice
      icon={LockKeyhole}
      title="Authentication required"
      body={body}
      action={
        <button type="button" onClick={() => openLogin()} className="btn btn-primary mt-6">
          <KeyRound aria-hidden className="size-4" />
          Secure Login
        </button>
      }
    />
  );
}
