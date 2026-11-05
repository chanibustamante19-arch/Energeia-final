import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatCard({ label, value, unit = '', delta = null, deltaLabel = '', icon: Icon = null, tone = 'muted', delay = 0 }) {
  const positive = delta > 0;
  const neutral = delta === 0 || delta === undefined || delta === null;

  return (
    <div className="card-interactive animate-rise p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-semibold text-muted-foreground">{label}</p>
        {Icon && (
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl',
              tone === 'lime' && 'bg-[#B7F34A]/25 text-[#5c7f10] dark:text-[#B7F34A]',
              tone === 'eco' && 'bg-[#27AE83]/12 text-[#1c8f6b] dark:text-[#48C9A2]',
              tone === 'muted' && 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end gap-1.5">
        <span className="font-heading text-[26px] font-extrabold leading-none tracking-tight text-foreground">
          {value}
        </span>
        {unit && <span className="pb-0.5 text-xs font-semibold text-muted-foreground">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {!neutral && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-bold',
              positive
                ? 'bg-[#F08A5D]/15 text-[#C4592C] dark:text-[#F09A72]'
                : 'bg-[#27AE83]/15 text-[#1c8f6b] dark:text-[#4ED0A6]'
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
        <span className="text-muted-foreground">{deltaLabel}</span>
      </div>
    </div>
  );
}