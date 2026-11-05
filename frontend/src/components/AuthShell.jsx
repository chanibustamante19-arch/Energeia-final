import { Link } from 'react-router-dom';
import { ArrowLeft, Quote, Zap } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.02fr_1fr]">
      {/* Brand panel — desktop */}
      <aside className="relative hidden overflow-hidden bg-[#101C2C] px-12 py-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#B7F34A]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#27AE83]/30 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-1/3 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute right-20 top-1/3 h-44 w-44 rounded-full border border-white/[0.07]" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B7F34A] to-[#27AE83]">
            <Zap className="h-5 w-5 text-[#101C2C]" fill="#101C2C" strokeWidth={2.4} />
          </span>
          <span className="font-heading text-lg font-extrabold tracking-tight">Energeia</span>
        </Link>

        <div className="relative mt-auto max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B7F34A]">
            Household energy intelligence
          </p>
          <h2 className="mt-4 font-heading text-[36px] font-extrabold leading-[1.08] tracking-tight">
            Every kilowatt,
            <br />
            clearly accounted for.
          </h2>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/55">
            Track appliance loads, forecast your bill and test schedule changes before you commit to them.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-2.5">
            {[
              { value: '431', unit: 'kWh', label: 'Tracked' },
              { value: '₱5,389', unit: '', label: 'Forecast' },
              { value: '8', unit: 'loads', label: 'Managed' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
                <p className="font-heading text-lg font-extrabold leading-none">{stat.value}</p>
                <p className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/40">
                  {stat.unit || stat.label}
                </p>
                {stat.unit && (
                  <p className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/25">
                    {stat.label}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <Quote className="h-4 w-4 shrink-0 text-[#B7F34A]" />
            <p className="text-[12px] leading-relaxed text-white/60">
              “We found ₱900 of monthly savings in the first week — just from rescheduling two appliances.”
            </p>
          </div>
        </div>

        <p className="relative mt-10 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/25">
          Design prototype · sample data
        </p>
      </aside>

      {/* Form panel */}
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b border-border/60 bg-[#101C2C] px-5 py-3.5 text-white lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#B7F34A] to-[#27AE83]">
              <Zap className="h-4 w-4 text-[#101C2C]" fill="#101C2C" strokeWidth={2.4} />
            </span>
            <span className="font-heading text-[15px] font-extrabold">Energeia</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-white/60">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>

        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[400px] animate-rise">
            <div className="mb-7">
              <Link
                to="/"
                className="mb-6 hidden items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to site
              </Link>
              <h1 className="font-heading text-[28px] font-extrabold tracking-tight text-foreground">{title}</h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{subtitle}</p>
            </div>

            {children}

            {footer && <div className="mt-6 text-center text-[12.5px] text-muted-foreground">{footer}</div>}

            <p className="mt-8 text-center text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              Design prototype · authentication is visual only
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}