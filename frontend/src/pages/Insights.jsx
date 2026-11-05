import { useState } from 'react';
import { Leaf, RotateCcw, Sparkles, TrendingDown, Zap } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import RecommendationCard from '@/components/insights/RecommendationCard';
import { formatPeso } from '@/lib/energy';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useHouseholdData } from '@/lib/HouseholdDataContext';

const FILTERS = [
  { id: 'all', label: 'All insights' },
  { id: 'high', label: 'High impact' },
  { id: 'medium', label: 'Medium impact' },
  { id: 'low', label: 'Low impact' },
];

export default function Insights() {
  const { toast } = useToast();
  const { insights, dismissedInsightIds, dismissInsight, restoreInsights } = useHouseholdData();
  const [filter, setFilter] = useState('all');

  const visible = insights.filter(
    (item) => !dismissedInsightIds.includes(item.id) && (filter === 'all' || item.impact === filter)
  );

  const active = insights.filter((item) => !dismissedInsightIds.includes(item.id));
  const totalCost = active.reduce((sum, item) => sum + item.savingCost, 0);
  const totalKwh = active.reduce((sum, item) => sum + item.savingKwh, 0);

  const dismiss = async (item) => {
    try {
      await dismissInsight(item.id);
      toast({ title: 'Recommendation dismissed', description: item.title });
    } catch (error) {
      console.error('Unable to dismiss recommendation:', error);
      toast({ title: 'Unable to dismiss recommendation', description: error.message, variant: 'destructive' });
    }
  };

  const restore = async () => {
    try {
      await restoreInsights();
      toast({ title: 'Recommendations restored' });
    } catch (error) {
      console.error('Unable to restore recommendations:', error);
      toast({ title: 'Unable to restore recommendations', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Recommendations"
        title="Energy insights"
        description="Rule-based suggestions calculated from your household's appliance usage and electricity rate."
        actions={
          dismissedInsightIds.length > 0 && (
            <button type="button" onClick={restore} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Restore dismissed
            </button>
          )
        }
      />

      <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#B7F34A] via-[#B7F34A] to-[#27AE83] p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/25 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#101C2C]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#101C2C]">
              <Sparkles className="h-3 w-3" /> Savings opportunity
            </span>
            <h2 className="mt-3 font-heading text-[26px] font-extrabold leading-tight text-[#101C2C] sm:text-[30px]">
              {formatPeso(totalCost)} a month is within reach.
            </h2>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#101C2C]/70">
              Applying the {active.length} open recommendations would cut {totalKwh} kWh from your next cycle.
            </p>
          </div>
          <div className="grid w-full grid-cols-3 gap-2 sm:w-auto">
            {[
              { label: 'Yearly', value: formatPeso(totalCost * 12) },
              { label: 'Energy', value: `${totalKwh} kWh` },
              { label: 'CO₂ cut', value: `${Math.round(totalKwh * 12 * 0.54)} kg` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-[#101C2C] px-4 py-3 text-white">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/45">{stat.label}</p>
                <p className="mt-1 font-heading text-[17px] font-extrabold leading-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Open insights', value: active.length, icon: Sparkles },
          { label: 'Monthly potential', value: formatPeso(totalCost), icon: TrendingDown },
          { label: 'Energy saved', value: `${totalKwh} kWh`, icon: Zap },
        ].map((stat) => (
          <div key={stat.label} className="card-surface flex items-center gap-3 px-4 py-3.5">
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:flex">
              <stat.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-0.5 font-heading text-[15px] font-extrabold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={cn('chip shrink-0', filter === option.id && 'chip-active')}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card-surface flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B7F34A]/25 text-[#5c7f10] dark:text-[#B7F34A]">
            <Leaf className="h-6 w-6" />
          </span>
          <p className="mt-4 font-heading text-base font-bold">You're all caught up</p>
          <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
            No open recommendations in this filter. Restore dismissed insights to review them again.
          </p>
          <button type="button" onClick={restore} className="btn-ghost mt-5">
            <RotateCcw className="h-4 w-4" /> Restore dismissed
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          {visible.map((item, index) => (
            <div key={item.id} style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}>
              <RecommendationCard item={item} onDismiss={dismiss} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}