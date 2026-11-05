import { Link } from 'react-router-dom';
import AuthShell from '@/components/AuthShell';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your household"
      subtitle="Continue with Google to create your Energeia account and private household."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-foreground hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleSignInButton label="Create account with Google" />
      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        Your account and an initial household are created automatically the first time you sign in.
      </p>
    </AuthShell>
  );
}
