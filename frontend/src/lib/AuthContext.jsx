import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, requireSupabase } from '@/api/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;
    const client = requireSupabase();
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setAuthError(null);
        setIsLoadingAuth(false);
      }
    });

    client.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) throw error;
        setSession(data.session);
        setIsLoadingAuth(false);
      })
      .catch((error) => {
        if (!active) return;
        console.error('Unable to restore the Supabase session:', error);
        setAuthError(error.message || 'Unable to restore your session.');
        setIsLoadingAuth(false);
      });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/overview` },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw error;
  }, []);

  const signOutEverywhere = useCallback(async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signOut({ scope: 'global' });
    if (error) throw error;
  }, []);

  const user = session?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: Boolean(user),
        isLoadingAuth,
        authError,
        signInWithGoogle,
        signOut,
        signOutEverywhere,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
