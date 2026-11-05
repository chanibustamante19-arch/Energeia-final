import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatPeso } from '@/lib/energy';
import { CHART, axisProps, gridProps, tooltipLabelStyle, tooltipStyle } from '@/lib/chartTheme';

export default function SpendingCard({ monthly = [] }) {
  const data = monthly.filter((item) => item.hasData);
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  const change = latest && previous?.cost
    ? (((latest.cost - previous.cost) / previous.cost) * 100).toFixed(1)
    : null;

  return (
    <section className="card-surface animate-rise p-5 sm:p-6" style={{ animationDelay: '120ms' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-bold">Spending overview</h2>
          <p className="mt-1 text-xs text-muted-foreground">Actual or estimated bills by month</p>
        </div>
        {change !== null && <span className="chip border-transparent bg-[#27AE83]/12 text-[#1c8f6b] dark:text-[#4ED0A6]">{change}% vs previous</span>}
      </div>

      <p className="mt-4 font-heading text-2xl font-extrabold">{latest ? formatPeso(latest.cost) : '—'}</p>
      <p className="text-[11px] font-semibold text-muted-foreground">
        {latest ? `${latest.label} ${latest.year} · ${latest.kwh} kWh` : 'Add a bill or meter reading to track spending'}
      </p>

      {data.length ? (
        <div className="-ml-2 mt-3 h-[196px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 6, right: 4, left: 0, bottom: 0 }} barCategoryGap="26%">
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} interval={1} />
              <YAxis {...axisProps} width={40} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.6 }} formatter={(value) => [formatPeso(value), 'Bill']} />
              <Bar dataKey="cost" radius={[6, 6, 4, 4]} animationDuration={800}>
                {data.map((entry, index) => (
                  <Cell key={`${entry.year}-${entry.label}`} fill={index === data.length - 1 ? CHART.eco : 'hsl(var(--muted-foreground))'} fillOpacity={index === data.length - 1 ? 1 : 0.28} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-3 flex h-[196px] items-center justify-center rounded-xl bg-muted/40 text-center text-sm text-muted-foreground">
          Your monthly costs will appear here.
        </div>
      )}
    </section>
  );
}
