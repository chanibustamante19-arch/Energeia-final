import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, requireSupabase } from '@/api/supabaseClient';

const AuthContext = createContext(null);
const NATIVE_AUTH_REDIRECT = 'com.kevkyle.energeia://auth/callback';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState(null);
  const processedAuthUrls = useRef(new Set());

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

  useEffect(() => {
    if (!isSupabaseConfigured || !Capacitor.isNativePlatform()) return undefined;

    let active = true;
    let appUrlListener;
    const client = requireSupabase();

    const handleAuthUrl = async (url) => {
      let callbackUrl;
      try {
        callbackUrl = new URL(url);
      } catch {
        return;
      }

      if (
        callbackUrl.protocol !== 'com.kevkyle.energeia:'
        || callbackUrl.hostname !== 'auth'
        || callbackUrl.pathname !== '/callback'
        || processedAuthUrls.current.has(url)
      ) {
        return;
      }
      processedAuthUrls.current.add(url);

      try {
        const callbackError = callbackUrl.searchParams.get('error_description')
          || callbackUrl.searchParams.get('error');
        if (callbackError) throw new Error(callbackError);

        const code = callbackUrl.searchParams.get('code');
        if (!code) throw new Error('Google sign-in did not return an authorization code.');

        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error) throw error;
        setAuthError(null);
      } catch (error) {
        console.error('Unable to complete native Google sign-in:', error);
        setAuthError(error.message || 'Unable to complete Google sign-in.');
      } finally {
        try {
          await Browser.close();
        } catch (error) {
          console.warn('Unable to close the Google sign-in browser:', error);
        }
      }
    };

    const handleAppUrl = ({ url }) => {
      handleAuthUrl(url);
    };

    App.addListener('appUrlOpen', handleAppUrl)
      .then((listener) => {
        if (!active) {
          listener.remove();
          return;
        }
        appUrlListener = listener;
        return App.getLaunchUrl();
      })
      .then((launchUrl) => {
        if (active && launchUrl?.url) return handleAuthUrl(launchUrl.url);
        return undefined;
      })
      .catch((error) => {
        if (!active) return;
        console.error('Unable to initialize native sign-in callback handling:', error);
        setAuthError(error.message || 'Unable to initialize Google sign-in.');
      });

    return () => {
      active = false;
      if (appUrlListener) appUrlListener.remove();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const client = requireSupabase();
    const isNative = Capacitor.isNativePlatform();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: isNative ? NATIVE_AUTH_REDIRECT : `${window.location.origin}/overview`,
        skipBrowserRedirect: isNative,
      },
    });
    if (error) throw error;
    if (isNative) {
      if (!data.url) throw new Error('Supabase did not return a Google sign-in URL.');
      await Browser.open({ url: data.url });
    }
  }, []);

  const signInWithEmail = useCallback(async ({ email, password }) => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUpWithEmail = useCallback(async ({ email, password, fullName }) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/overview`,
      },
    });
    if (error) throw error;
    return data;
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
        signInWithEmail,
        signUpWithEmail,
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
