import { X } from 'lucide-react';
import ApplianceIcon from '@/components/ApplianceIcon';
import { formatPeso } from '@/lib/energy';
import { cn } from '@/lib/utils';

const IMPACTS = {
  high: { label: 'High impact', className: 'bg-[#27AE83]/12 text-[#1c8f6b] dark:text-[#4ED0A6]' },
  medium: { label: 'Medium impact', className: 'bg-[#B7F34A]/30 text-[#5c7f10] dark:text-[#B7F34A]' },
  low: { label: 'Low impact', className: 'bg-muted text-muted-foreground' },
};

export default function RecommendationCard({ item, onDismiss }) {
  const impact = IMPACTS[item.impact] || IMPACTS.low;

  return (
    <article className="card-interactive animate-rise flex flex-col p-5">
      <div className="flex items-start gap-3">
        <ApplianceIcon icon={item.icon} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn('rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em]', impact.className)}>
              {impact.label}
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {item.category}
            </span>
          </div>
          <h3 className="mt-2 font-heading text-[15px] font-bold leading-snug">{item.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(item)}
          className="btn-icon h-8 w-8 shrink-0"
          aria-label={`Dismiss ${item.title}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Energy saved</p>
          <p className="mt-0.5 text-[13px] font-bold">{item.savingKwh} kWh / mo</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Bill saved</p>
          <p className="mt-0.5 text-[13px] font-bold text-[#1c8f6b] dark:text-[#4ED0A6]">
            {formatPeso(item.savingCost)} / mo
          </p>
        </div>
      </div>
    </article>
  );
}