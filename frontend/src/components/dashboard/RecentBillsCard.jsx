import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatPeso } from '@/lib/energy';

export default function RecentBillsCard({ bills = [] }) {
  const rows = bills.slice(0, 4);

  return (
    <section className="card-surface animate-rise p-5 sm:p-6" style={{ animationDelay: '160ms' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-base font-bold">Recent billing activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">Estimated vs actual charges</p>
        </div>
        <Link
          to="/history"
          className="inline-flex items-center gap-1 text-[12px] font-bold text-[#1c8f6b] hover:underline dark:text-[#4ED0A6]"
        >
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="-mx-5 mt-4 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[440px] border-collapse">
          <thead>
            <tr>
              <th className="table-head">Period</th>
              <th className="table-head text-right">Usage</th>
              <th className="table-head text-right">Estimated</th>
              <th className="table-head text-right">Actual</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((bill) => (
              <tr key={bill.id} className="transition-colors hover:bg-muted/50">
                <td className="table-cell font-semibold">{bill.period}</td>
                <td className="table-cell text-right text-muted-foreground">{bill.kwh} kWh</td>
                <td className="table-cell text-right text-muted-foreground">{formatPeso(bill.estimated)}</td>
                <td className="table-cell text-right font-bold">{bill.actual === null ? '—' : formatPeso(bill.actual)}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="table-cell text-center text-muted-foreground" colSpan={4}>No billing records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}