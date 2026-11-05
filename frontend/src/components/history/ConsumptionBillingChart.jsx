import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatPeso } from '@/lib/energy';
import { CHART, axisProps, gridProps, tooltipLabelStyle, tooltipStyle } from '@/lib/chartTheme';

export default function ConsumptionBillingChart({ data = [] }) {
  const entries = data.filter((item) => item.hasData);

  return (
    <section className="card-surface animate-rise p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-bold">Consumption vs billing</h2>
          <p className="mt-1 text-xs text-muted-foreground">Monthly usage in kWh with the recorded rate</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#27AE83]" /> kWh</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#E8B23A]" /> Rate</span>
        </div>
      </div>
      {entries.length ? (
        <div className="-ml-2 mt-5 h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={entries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} width={36} />
              <YAxis yAxisId="rate" orientation="right" {...axisProps} width={44} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.6 }}
                formatter={(value, name) => name === 'kwh' ? [`${value} kWh`, 'Usage'] : [formatPeso(value, 2), 'Rate']}
              />
              <Bar dataKey="kwh" fill={CHART.eco} radius={[6, 6, 3, 3]} animationDuration={800} />
              <Line yAxisId="rate" type="monotone" dataKey="rate" stroke={CHART.amber} strokeWidth={2.5} dot={{ r: 3, fill: CHART.amber, strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-5 flex h-[260px] items-center justify-center rounded-xl bg-muted/40 px-4 text-center text-sm text-muted-foreground">
          Add a bill or daily reading to populate your history chart.
        </div>
      )}
    </section>
  );
}
