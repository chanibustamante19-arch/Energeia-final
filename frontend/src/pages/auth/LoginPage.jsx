import { Link } from 'react-router-dom';
import AuthShell from '@/components/AuthShell';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome to Energeia"
      subtitle="Sign in with Google to view and manage your household energy data."
      footer={
        <>
          New to Energeia?{' '}
          <Link to="/register" className="font-bold text-foreground hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleSignInButton />
      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        Your household records are private and protected by Supabase row-level security.
      </p>
    </AuthShell>
  );
}
