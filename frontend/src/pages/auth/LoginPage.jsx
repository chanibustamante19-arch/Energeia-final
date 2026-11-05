import { Link } from 'react-router-dom';
import AuthShell from '@/components/AuthShell';
import EmailPasswordForm from '@/components/auth/EmailPasswordForm';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome to Energeia"
      subtitle="Sign in with your email and password or continue with Google."
      footer={
        <>
          New to Energeia?{' '}
          <Link to="/register" className="font-bold text-foreground hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <EmailPasswordForm mode="login" />
      <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleSignInButton />
      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        Your household records are private and protected by Supabase row-level security.
      </p>
    </AuthShell>
  );
}
