import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { PIE_COLORS, tooltipStyle } from '@/lib/chartTheme';

export default function BreakdownCard({ appliances = [] }) {
  const top = [...appliances].sort((a, b) => b.kwh - a.kwh).slice(0, 5);
  const others = appliances.filter((item) => !top.includes(item)).reduce((sum, item) => sum + item.kwh, 0);
  const total = appliances.reduce((sum, item) => sum + item.kwh, 0);
  const data = [...top.map((item) => ({ name: item.name, value: item.kwh }))];
  if (others > 0) data.push({ name: 'Everything else', value: others });

  return (
    <section className="card-surface animate-rise p-5 sm:p-6" style={{ animationDelay: '80ms' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-base font-bold">Where it goes</h2>
          <p className="mt-1 text-xs text-muted-foreground">Estimated split by appliance</p>
        </div>
        <Link to="/appliances" className="btn-icon" aria-label="Open appliances"><ArrowUpRight className="h-4 w-4" /></Link>
      </div>
      {data.length ? (
        <>
          <div className="relative mx-auto mt-2 h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none" animationDuration={800}>
                  {data.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} kWh`, 'Estimated']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-xl font-extrabold">{Math.round(total)}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">kWh / mo</span>
            </div>
          </div>
          <ul className="mt-3 space-y-2.5">
            {data.slice(0, 4).map((entry, index) => (
              <li key={entry.name} className="flex items-center gap-2.5 text-xs">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                <span className="min-w-0 flex-1 truncate font-medium text-foreground/80">{entry.name}</span>
                <span className="shrink-0 font-bold">{total ? Math.round((entry.value / total) * 100) : 0}%</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="flex h-[250px] flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold">No appliance estimates yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Add appliances to see your usage breakdown.</p>
        </div>
      )}
    </section>
  );
}
