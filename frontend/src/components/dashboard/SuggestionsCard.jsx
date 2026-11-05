import { Link } from 'react-router-dom';
import { ArrowUpRight, Lightbulb } from 'lucide-react';
import { formatPeso } from '@/lib/energy';
import ApplianceIcon from '@/components/ApplianceIcon';

export default function SuggestionsCard({ items = [] }) {
  const topItems = items.slice(0, 3);
  const potential = topItems.reduce((sum, item) => sum + item.savingCost, 0);

  return (
    <section className="card-surface animate-rise p-5 sm:p-6" style={{ animationDelay: '200ms' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-base font-bold">Save this month</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {topItems.length ? `Up to ${formatPeso(potential)} in estimated monthly savings` : 'Based on your appliance usage'}
          </p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B7F34A]/25 text-[#5c7f10] dark:text-[#B7F34A]">
          <Lightbulb className="h-4.5 w-4.5" />
        </span>
      </div>

      <ul className="mt-4 space-y-2.5">
        {topItems.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-border/60 p-3 transition-colors hover:bg-muted/50"
          >
            <ApplianceIcon icon={item.icon} size="sm" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-snug">{item.title}</p>
              <p className="mt-0.5 text-[11.5px] font-semibold text-[#1c8f6b] dark:text-[#4ED0A6]">
                ≈ {formatPeso(item.savingCost)}/mo
              </p>
            </div>
          </li>
        ))}
        {!topItems.length && (
          <li className="rounded-xl border border-dashed border-border p-3 text-[12px] text-muted-foreground">
            Add appliances to get personalized energy-saving recommendations.
          </li>
        )}
      </ul>

      <Link
        to="/insights"
        className="mt-4 flex items-center justify-between rounded-xl bg-muted/70 px-3.5 py-2.5 text-[12.5px] font-bold transition-colors hover:bg-muted"
      >
        All recommendations
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </section>
  );
}