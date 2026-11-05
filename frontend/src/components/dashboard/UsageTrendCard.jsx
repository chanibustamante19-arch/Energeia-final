import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, axisProps, gridProps, tooltipLabelStyle, tooltipStyle } from '@/lib/chartTheme';
import { cn } from '@/lib/utils';

export default function UsageTrendCard({ weekly = [], monthly = [] }) {
  const [range, setRange] = useState('week');
  const RANGES = [
    { id: 'week', label: 'This week', data: weekly },
    { id: 'month', label: '12 months', data: monthly },
  ];
  const active = RANGES.find((item) => item.id === range) || RANGES[0];
  const chartData = active.data.filter((item) => item.hasData);
  const total = chartData.reduce((sum, item) => sum + item.kwh, 0);
  const peak = chartData.length ? Math.max(...chartData.map((item) => item.kwh)) : 0;

  return (
    <section className="card-surface animate-rise p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-bold">Consumption trend</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {range === 'week' ? 'Daily usage, last 7 days' : 'Monthly usage, last 12 months'}
          </p>
        </div>
        <div className="flex rounded-xl bg-muted p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[11.5px] font-bold transition-all duration-200',
                range === r.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Total</p>
          <p className="mt-1 font-heading text-2xl font-extrabold">
            {total.toLocaleString('en-PH', { maximumFractionDigits: 1 })}
            <span className="ml-1 text-sm font-semibold text-muted-foreground">kWh</span>
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Peak</p>
          <p className="mt-1 font-heading text-2xl font-extrabold">
            {peak.toLocaleString('en-PH', { maximumFractionDigits: 1 })}
            <span className="ml-1 text-sm font-semibold text-muted-foreground">kWh</span>
          </p>
        </div>
      </div>

      {chartData.length ? <div className="-ml-2 mt-4 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.eco} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART.eco} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} padding={{ left: 8, right: 8 }} />
            <YAxis {...axisProps} width={36} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(value) => [`${value} kWh`, 'Usage']}
              cursor={{ stroke: CHART.eco, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="kwh"
              stroke={CHART.eco}
              strokeWidth={2.5}
              fill="url(#usageFill)"
              animationDuration={800}
              dot={{ r: 3, fill: CHART.eco, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: CHART.lime, stroke: CHART.eco, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div> : (
        <div className="mt-4 flex h-[240px] items-center justify-center rounded-xl bg-muted/40 px-4 text-center text-sm text-muted-foreground">
          Add daily meter readings or billing records to see your consumption trend.
        </div>
      )}
    </section>
  );
}