import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import GoogleIcon from '@/components/GoogleIcon';
import { useAuth } from '@/lib/AuthContext';
import { isSupabaseConfigured } from '@/api/supabaseClient';

export default function GoogleSignInButton({ label = 'Continue with Google' }) {
  const { signInWithGoogle, authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (signInError) {
      console.error('Google sign-in failed:', signInError);
      setError(signInError.message || 'Unable to start Google sign-in.');
      setLoading(false);
    }
  };

  return (
    <div>
      {!isSupabaseConfigured && (
        <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[12px] leading-relaxed text-foreground">
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment, then enable Google in Supabase Authentication.
        </p>
      )}
      {(error || authError) && <p role="alert" className="mb-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">{error || authError}</p>}
      <button
        type="button"
        onClick={signIn}
        disabled={loading || !isSupabaseConfigured}
        className="btn-primary h-11 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4.5 w-4.5" />}
        {loading ? 'Connecting to Google…' : label}
      </button>
    </div>
  );
}
