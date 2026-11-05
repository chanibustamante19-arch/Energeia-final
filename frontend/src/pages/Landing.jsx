import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Flame,
  Leaf,
  Moon,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Understand every kilowatt',
    body: 'Appliance-level estimates, daily trends and a bill forecast that updates as your loads change.',
  },
  {
    icon: Leaf,
    title: 'Savings you can act on',
    body: 'Plain-language recommendations ranked by the pesos they put back in your pocket each month.',
  },
  {
    icon: Sparkles,
    title: 'Plan before you commit',
    body: 'What-if scenarios simulate new schedules and appliance changes without touching your real data.',
  },
];

export default function Landing() {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#B7F34A] to-[#27AE83]">
              <Zap className="h-4.5 w-4.5 text-[#101C2C]" strokeWidth={2.6} fill="#101C2C" />
            </span>
            <span className="font-heading text-[17px] font-extrabold tracking-tight">Energeia</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-6 text-[13px] font-semibold text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#numbers" className="transition-colors hover:text-foreground">Dashboard</a>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={toggle} className="btn-icon h-9 w-9 rounded-lg border border-border" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link to="/login" className="hidden text-[13px] font-bold text-foreground sm:block px-2">
              Sign in
            </Link>
            <Link to="/overview" className="btn-lime h-9 px-4 text-[13px]">
              Open dashboard
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#27AE83]/10 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="animate-rise">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#27AE83]/25 bg-[#27AE83]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1c8f6b] dark:text-[#4ED0A6]">
                  <Flame className="h-3.5 w-3.5" /> Eco-tech energy intelligence
                </span>
                <h1 className="mt-5 font-heading text-[38px] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-[54px]">
                  Know what your
                  <br />
                  home is really
                  <span className="relative ml-2 inline-block">
                    <span className="relative z-10">using.</span>
                    <span className="absolute inset-x-0 bottom-1.5 z-0 h-3.5 rounded-sm bg-[#B7F34A]" />
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                  Energeia turns your appliances, schedules and rate plan into a clear monthly forecast — plus
                  the specific changes that lower it.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link to="/overview" className="btn-primary px-5">
                    Explore the dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/register" className="btn-ghost px-5">
                    Create an account
                  </Link>
                </div>
                <p className="mt-5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Supabase-powered · your household data stays private
                </p>
              </div>

              <div className="animate-rise" style={{ animationDelay: '120ms' }}>
                <div className="card-surface relative overflow-hidden p-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Your energy workspace
                      </p>
                      <p className="mt-1 font-heading text-[25px] font-extrabold leading-tight">Built around your home</p>
                    </div>
                    <span className="rounded-lg bg-[#27AE83]/12 px-2 py-1 text-[11px] font-bold text-[#1c8f6b] dark:text-[#4ED0A6]">
                      Live records
                    </span>
                  </div>
                  <div className="mt-6 space-y-3">
                    {['Add appliances and schedules', 'Record bills and meter readings', 'Compare trends and savings scenarios'].map((step, index) => (
                      <div key={step} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B7F34A] text-xs font-extrabold text-[#101C2C]">{index + 1}</span>
                        <span className="text-[13px] font-semibold">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card-interactive p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B7F34A]/22 text-[#5c7f10] dark:text-[#B7F34A]">
                  <feature.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-heading text-[17px] font-bold">{feature.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="numbers" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-[26px] bg-[#101C2C] px-6 py-12 text-white sm:px-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#B7F34A]/20 blur-3xl" />
            <div className="relative grid gap-8 sm:grid-cols-[1.2fr_1fr] sm:items-center">
              <div>
                <h2 className="font-heading text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]">
                  Your household, forecast in seconds.
                </h2>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/60">
                  Set your provider and rate once. Energeia keeps the estimates current as your appliances and
                  schedules change.
                </p>
                <Link to="/overview" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#B7F34A] px-5 text-[13px] font-bold text-[#101C2C]">
                  Open the dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'Live', label: 'Appliance estimates' },
                  { value: 'Saved', label: 'Billing history' },
                  { value: 'Private', label: 'Household records' },
                  { value: 'Flexible', label: 'What-if plans' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="font-heading text-2xl font-extrabold">{stat.value}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-[12px] text-muted-foreground sm:flex-row sm:px-6">
          <p>© 2026 Energeia. Household energy intelligence.</p>
          <div className="flex items-center gap-4 font-semibold">
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
            <Link to="/register" className="hover:text-foreground">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}