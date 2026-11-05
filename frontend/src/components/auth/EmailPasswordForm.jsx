import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { isSupabaseConfigured } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function EmailPasswordForm({ mode }) {
  const isRegister = mode === 'register';
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (isRegister) {
        const data = await signUpWithEmail({ email: email.trim(), password, fullName });
        if (data.session) {
          navigate('/overview', { replace: true });
        } else {
          setNotice('Your account was created. Check your email for a confirmation link, then sign in.');
        }
      } else {
        await signInWithEmail({ email: email.trim(), password });
        navigate('/overview', { replace: true });
      }
    } catch (authError) {
      console.error(`Email ${isRegister ? 'sign-up' : 'sign-in'} failed:`, authError);
      setError(authError.message || `Unable to ${isRegister ? 'create an account' : 'sign in'}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {!isSupabaseConfigured && (
        <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[12px] leading-relaxed text-foreground">
          Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to use authentication.
        </p>
      )}
      {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-[#27AE83]/10 px-3 py-2.5 text-[12px] leading-relaxed text-foreground">{notice}</p>}

      {isRegister && (
        <div>
          <label className="field-label" htmlFor="auth-name">Full name</label>
          <input
            id="auth-name"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            maxLength={120}
            className="input-base"
          />
        </div>
      )}

      <div>
        <label className="field-label" htmlFor="auth-email">Email address</label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="input-base"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          className="input-base"
        />
        {isRegister && <p className="mt-1.5 text-[11px] text-muted-foreground">Use at least 8 characters.</p>}
      </div>

      <button
        type="submit"
        disabled={loading || !isSupabaseConfigured}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? (isRegister ? 'Creating account…' : 'Signing in…') : (isRegister ? 'Create account with email' : 'Sign in with email')}
      </button>
    </form>
  );
}
