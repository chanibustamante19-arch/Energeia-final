import { formatPeso } from '@/lib/energy';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

export default function BillsTable({ rows, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr>
            <th className="table-head">Billing period</th>
            <th className="table-head text-right">Usage</th>
            <th className="table-head text-right">Rate</th>
            <th className="table-head text-right">Estimated</th>
            <th className="table-head text-right">Actual</th>
            <th className="table-head text-right">Variance</th>
            <th className="table-head text-right">Status</th>
            <th className="table-head text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((bill) => {
            const variance = bill.actual !== null ? bill.actual - bill.estimated : null;
            return (
              <tr key={bill.id} className="transition-colors hover:bg-muted/50">
                <td className="table-cell">
                  <span className="block font-semibold">{bill.period}</span>
                  <span className="block text-[11px] text-muted-foreground">{bill.cycle}</span>
                </td>
                <td className="table-cell text-right text-muted-foreground">{bill.kwh} kWh</td>
                <td className="table-cell text-right text-muted-foreground">₱{bill.rate.toFixed(2)}</td>
                <td className="table-cell text-right text-muted-foreground">{formatPeso(bill.estimated)}</td>
                <td className="table-cell text-right font-bold">
                  {bill.actual !== null ? formatPeso(bill.actual) : '—'}
                </td>
                <td
                  className={cn(
                    'table-cell text-right font-semibold',
                    variance === null && 'text-muted-foreground',
                    variance > 0 && 'text-[#C4592C] dark:text-[#F09A72]',
                    variance <= 0 && variance !== null && 'text-[#1c8f6b] dark:text-[#4ED0A6]'
                  )}
                >
                  {variance === null ? 'Pending' : `${variance > 0 ? '+' : ''}${formatPeso(variance)}`}
                </td>
                <td className="table-cell text-right">
                  <span
                    className={cn(
                      'rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]',
                      bill.status === 'actual'
                        ? 'bg-[#27AE83]/12 text-[#1c8f6b] dark:text-[#4ED0A6]'
                        : 'bg-[#B7F34A]/30 text-[#5c7f10] dark:text-[#B7F34A]'
                    )}
                  >
                    {bill.status}
                  </span>
                </td>
                <td className="table-cell text-right">
                  <button type="button" onClick={() => onDelete(bill)} className="btn-icon ml-auto h-8 w-8" aria-label={`Delete ${bill.period} bill`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}