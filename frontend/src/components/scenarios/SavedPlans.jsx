import { FlaskConical, Play, Trash2 } from 'lucide-react';
import { formatPeso, monthlyKwh } from '@/lib/energy';

const planTotals = (plan, appliances) =>
  appliances.reduce((sum, appliance) => {
    const hours = plan.hours[appliance.id] !== undefined ? plan.hours[appliance.id] : appliance.hoursPerDay;
    return sum + monthlyKwh(appliance.wattage, appliance.quantity, hours);
  }, 0);

export default function SavedPlans({ plans, appliances, rate, onLoad, onDelete }) {
  return (
    <section className="card-surface animate-rise p-5 sm:p-6" style={{ animationDelay: '80ms' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-base font-bold">Saved plans</h2>
          <p className="mt-1 text-xs text-muted-foreground">Load a plan back into the canvas</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <FlaskConical className="h-4 w-4" />
        </span>
      </div>

      {plans.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">
          No saved plans yet. Adjust the canvas and save it for later.
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {plans.map((plan) => {
            const kwh = Math.round(planTotals(plan, appliances));
            return (
              <li key={plan.id} className="rounded-xl border border-border/70 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold">{plan.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{plan.note}</p>
                  </div>
                  <span className="shrink-0 rounded bg-[#B7F34A]/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#5c7f10] dark:text-[#B7F34A]">
                    Plan
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className="text-[11.5px] font-semibold text-muted-foreground">
                    {kwh} kWh · {formatPeso(Math.round(kwh * rate))}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onLoad(plan)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-[11.5px] font-bold transition-colors hover:bg-muted"
                    >
                      <Play className="h-3 w-3" /> Load
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(plan)}
                      className="btn-icon h-8 w-8"
                      aria-label={`Delete ${plan.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 rounded-xl bg-muted/60 p-3">
        <p className="text-[11px] font-semibold leading-relaxed text-muted-foreground">
          Simulated scenarios never modify appliance records, schedules or household consumption.
        </p>
      </div>
    </section>
  );
}