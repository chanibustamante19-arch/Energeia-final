import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, LogOut, Moon, Sun, Zap } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/nav';
import { useAuth } from '@/lib/AuthContext';
import { useHouseholdData } from '@/lib/HouseholdDataContext';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B7F34A] to-[#27AE83]">
        <Zap className="h-5 w-5 text-[#101C2C]" strokeWidth={2.6} fill="#101C2C" />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="font-heading text-[17px] font-extrabold tracking-tight">Energeia</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Energy intelligence</p>
        </div>
      )}
    </div>
  );
}

function Navigation({ mobile = false }) {
  return (
    <nav className={cn(mobile ? 'grid grid-cols-6' : 'mt-7 flex flex-col gap-1')}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          title={mobile ? item.label : undefined}
          className={({ isActive }) => cn(
            mobile
              ? 'flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[9px] font-semibold'
              : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
            isActive
              ? mobile ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <item.icon className={cn(mobile ? 'h-[18px] w-[18px]' : 'h-[18px] w-[18px]')} strokeWidth={2} />
          <span className={mobile ? 'max-w-full truncate' : ''}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function HouseholdSelector({ compact = false }) {
  const [open, setOpen] = useState(false);
  const { households, household, selectHousehold } = useHouseholdData();

  if (!household) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-left text-sm font-semibold',
          compact && 'h-9 max-w-[150px] px-2 text-xs'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#27AE83]" />
        <span className="max-w-[180px] truncate">{household.name}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-label="Close household selector" />
          <ul role="listbox" className="absolute right-0 z-50 mt-2 max-h-72 w-64 overflow-auto rounded-2xl border border-border bg-popover p-1.5 shadow-xl">
            {households.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={item.id === household.id}
                  onClick={() => {
                    selectHousehold(item.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-muted"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {item.id === household.id && <Check className="h-4 w-4 text-[#27AE83]" />}
                  </span>
                  <span className="truncate">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="btn-icon h-10 w-10 border border-border bg-card"
    >
      {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { profile, household, error, isLoadingData, isLoadingHouseholds } = useHouseholdData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const name = profile?.fullName || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Account';
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  if (isLoadingHouseholds) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (signOutError) {
      console.error('Unable to sign out:', signOutError);
      toast({ title: 'Unable to sign out', description: signOutError.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-border/70 bg-card px-5 py-5 md:flex">
        <Logo />
        <Navigation />
        <div className="mt-auto rounded-2xl border border-border/70 p-3">
          <p className="truncate text-[13px] font-semibold">{name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
          <button type="button" onClick={handleSignOut} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <div className="md:pl-[264px]">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1420px] items-center gap-2 px-4 sm:px-6 lg:px-8">
            <div className="md:hidden"><Logo compact /></div>
            <div className="hidden items-center gap-2 md:flex">
              <span className="rounded-full border border-[#27AE83]/30 bg-[#27AE83]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1c8f6b] dark:text-[#4ED0A6]">
                Live household data
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <HouseholdSelector compact />
              <ThemeToggle />
              <button
                type="button"
                onClick={handleSignOut}
                className="btn-icon h-10 w-10 md:hidden"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <span className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary text-[12px] font-bold text-primary-foreground md:flex">
                {initials}
              </span>
            </div>
          </div>
        </header>

        {error && (
          <div role="alert" className="mx-4 mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:mx-8">
            {error}
          </div>
        )}
        {isLoadingData && (
          <div className="mx-4 mt-4 text-xs font-medium text-muted-foreground sm:mx-6 lg:mx-8">Syncing household data…</div>
        )}

        <main className="mx-auto max-w-[1420px] px-4 pb-28 pt-5 sm:px-6 sm:pt-8 md:pb-16 lg:px-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        <Navigation mobile />
      </nav>
    </div>
  );
}
