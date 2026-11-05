import { Archive, CalendarClock, Pencil, Zap } from 'lucide-react';
import ApplianceIcon from '@/components/ApplianceIcon';
import { formatPeso } from '@/lib/energy';
import { cn } from '@/lib/utils';

export default function ApplianceCard({ appliance, onEdit, onArchive }) {
  const active = appliance.schedules.filter((s) => s.status === 'active');
  const paused = appliance.schedules.filter((s) => s.status === 'paused');

  return (
    <article className="card-interactive animate-rise flex flex-col p-5">
      <div className="flex items-start gap-3">
        <ApplianceIcon icon={appliance.icon} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-[15px] font-bold leading-tight">{appliance.name}</h3>
          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
            {appliance.brand} · {appliance.category}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-md px-1.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]',
            active.length
              ? 'bg-[#27AE83]/12 text-[#1c8f6b] dark:text-[#4ED0A6]'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {active.length ? 'Active' : 'Paused'}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-3">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Load</dt>
          <dd className="mt-0.5 text-[13px] font-semibold">
            {appliance.wattage} W
            {appliance.quantity > 1 && <span className="text-muted-foreground"> × {appliance.quantity}</span>}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Run time</dt>
          <dd className="mt-0.5 text-[13px] font-semibold">{appliance.hoursPerDay} h / day</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Est. usage</dt>
          <dd className="mt-0.5 flex items-center gap-1 text-[13px] font-bold">
            <Zap className="h-3.5 w-3.5 text-[#27AE83]" /> {appliance.kwh} kWh
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Est. cost</dt>
          <dd className="mt-0.5 text-[13px] font-bold">{formatPeso(appliance.cost)}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          <CalendarClock className="h-3 w-3" /> Schedules · {appliance.schedules.length}
        </p>
        <ul className="mt-2 space-y-1.5">
          {appliance.schedules.slice(0, 2).map((schedule) => (
            <li key={schedule.id} className="flex items-center gap-2 text-[11.5px]">
              <span
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  schedule.status === 'active' ? 'bg-[#27AE83]' : 'bg-muted-foreground/40'
                )}
              />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {schedule.label} · {schedule.days}
              </span>
              <span className="shrink-0 font-semibold text-foreground/70">
                {schedule.start}–{schedule.end}
              </span>
            </li>
          ))}
        </ul>
        {paused.length > 0 && (
          <p className="mt-1.5 text-[10.5px] font-semibold text-muted-foreground">
            {paused.length} paused schedule{paused.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
        <button type="button" onClick={() => onEdit(appliance)} className="btn-ghost h-9 flex-1 px-3 text-[12.5px]">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          type="button"
          onClick={() => onArchive(appliance)}
          className="btn-icon h-9 w-9 border border-border"
          aria-label={`Archive ${appliance.name}`}
          title="Archive appliance"
        >
          <Archive className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}