import { RotateCcw, Sparkles } from 'lucide-react';
import ApplianceIcon from '@/components/ApplianceIcon';
import { formatPeso, monthlyKwh } from '@/lib/energy';
import { cn } from '@/lib/utils';

export default function ScenarioBuilder({ appliances, baseline, rate, adjustments, onChange, onReset, simKwh, simCost }) {
  const delta = simKwh - baseline;
  const max = Math.max(baseline, simKwh, 1);

  return (
    <section
      className="animate-rise rounded-[22px] border-2 border-dashed p-5 sm:p-6"
      style={{ borderColor: '#B7F34A', backgroundColor: 'hsl(var(--card))' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B7F34A]/25 text-[#5c7f10] dark:text-[#B7F34A]">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-bold">Scenario canvas</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Drag daily hours to simulate — your real records stay untouched.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#B7F34A] px-2 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-[#101C2C]">
            Simulated
          </span>
          <button type="button" onClick={onReset} className="btn-icon h-8 w-8" aria-label="Reset adjustments">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ul className="mt-5 divide-y divide-border/60">
        {appliances.map((appliance) => {
          const hours = adjustments[appliance.id] !== undefined ? adjustments[appliance.id] : appliance.hoursPerDay;
          const changed = hours !== appliance.hoursPerDay;
          const kwh = monthlyKwh(appliance.wattage, appliance.quantity, hours);
          return (
            <li key={appliance.id} className="py-3">
              <div className="flex items-center gap-3">
                <ApplianceIcon icon={appliance.icon} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13px] font-semibold">{appliance.name}</p>
                    {changed && (
                      <span className="shrink-0 rounded bg-[#B7F34A]/40 px-1 text-[9px] font-bold uppercase text-[#5c7f10] dark:text-[#B7F34A]">
                        adjusted
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {appliance.wattage} W × {appliance.quantity} · actual {appliance.hoursPerDay} h/day
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[12.5px] font-bold">
                    {kwh.toLocaleString('en-PH', { maximumFractionDigits: 1 })} kWh
                  </p>
                  <p className={cn('text-[10.5px] font-semibold', changed ? 'text-[#1c8f6b] dark:text-[#4ED0A6]' : 'text-muted-foreground')}>
                    {hours} h/day
                  </p>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={hours}
                onChange={(e) => onChange(appliance.id, Number(e.target.value))}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[#27AE83]"
                aria-label={`Simulated hours for ${appliance.name}`}
              />
            </li>
          );
        })}
      </ul>

      <div className="mt-5 rounded-2xl bg-[#101C2C] p-4 text-white">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Simulated usage</p>
            <p className="mt-1 font-heading text-[26px] font-extrabold leading-none">
              {simKwh} <span className="text-sm font-semibold text-white/50">kWh</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Simulated bill</p>
            <p className="mt-1 font-heading text-[26px] font-extrabold leading-none text-[#B7F34A]">
              {formatPeso(simCost)}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">Actual</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-white/35" style={{ width: `${(baseline / max) * 100}%` }} />
            </span>
            <span className="w-14 shrink-0 text-right text-[10.5px] font-semibold text-white/60">{baseline}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-[#B7F34A]">Sim</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-[#27AE83] to-[#B7F34A] transition-all duration-500"
                style={{ width: `${(simKwh / max) * 100}%` }}
              />
            </span>
            <span className="w-14 shrink-0 text-right text-[10.5px] font-semibold text-[#B7F34A]">{simKwh}</span>
          </div>
        </div>

        <p className="mt-3 text-[11.5px] font-semibold text-white/60">
          {delta === 0
            ? 'No change against the actual estimate.'
            : `${delta > 0 ? '+' : ''}${delta} kWh (${formatPeso(Math.round(delta * rate))}) versus actual household data.`}
        </p>
      </div>
    </section>
  );
}