import { Link } from 'react-router-dom';
import AuthShell from '@/components/AuthShell';
import EmailPasswordForm from '@/components/auth/EmailPasswordForm';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your household"
      subtitle="Create an account with any email address, or continue with Google."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-foreground hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <EmailPasswordForm mode="register" />
      <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleSignInButton label="Create account with Google" />
      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        If email confirmation is enabled, verify your address before signing in. Your household is created automatically.
      </p>
    </AuthShell>
  );
}
