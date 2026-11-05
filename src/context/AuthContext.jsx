import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/SupabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loginRequest, setLoginRequest] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session);
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Only sets state: awaiting Supabase calls in this callback can deadlock the client.
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  /** Resolves to true when the account still needs its email confirmed. */
  const signUp = useCallback(async ({ email, password, username }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: username ? { username } : undefined,
        emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).href,
      },
    });
    if (error) throw error;
    // With confirmations on, Supabase hides duplicates by returning a user with no identities.
    if (data.user && data.user.identities?.length === 0) {
      throw new Error('An account with this email already exists. Sign in instead.');
    }
    return !data.session;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  /** Opens the login modal. `reason` is an optional line shown at the top of it. */
  const openLogin = useCallback((reason = null) => setLoginRequest({ reason }), []);
  const closeLogin = useCallback(() => setLoginRequest(null), []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn,
      signUp,
      signOut,
      loginRequest,
      openLogin,
      closeLogin,
    }),
    [session, loading, signIn, signUp, signOut, loginRequest, openLogin, closeLogin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
