import { useMemo, useState } from 'react';
import { CalendarRange, CircleDollarSign, FilePlus2, Gauge, TrendingDown, Zap } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import BillsTable from '@/components/history/BillsTable';
import ConsumptionBillingChart from '@/components/history/ConsumptionBillingChart';
import { formatPeso, getMonthlyUsage } from '@/lib/energy';
import { useHouseholdData } from '@/lib/HouseholdDataContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const FILTERS = [
  { id: 'all', label: 'All periods' },
  { id: 'actual', label: 'Actual bills' },
  { id: 'estimated', label: 'Estimated' },
];

const todayISO = () => {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};

const initialBill = (rate) => ({
  periodStart: `${todayISO().slice(0, 7)}-01`,
  periodEnd: todayISO(),
  kwh: '',
  rate: rate ? String(rate) : '',
  actual: '',
});

export default function History() {
  const { toast } = useToast();
  const { household, bills, readings, saveBill, deleteBill, saveReading } = useHouseholdData();
  const [filter, setFilter] = useState('all');
  const [entryType, setEntryType] = useState('');
  const [billForm, setBillForm] = useState(() => initialBill(household?.rate));
  const [readingForm, setReadingForm] = useState({ date: todayISO(), kwh: '', cost: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const actualBills = bills.filter((bill) => bill.status === 'actual');
  const totalPaid = actualBills.reduce((sum, bill) => sum + bill.actual, 0);
  const avgKwh = actualBills.length
    ? Math.round(actualBills.reduce((sum, bill) => sum + bill.kwh, 0) / actualBills.length)
    : 0;
  const highest = actualBills.reduce((max, bill) => !max || bill.actual > max.actual ? bill : max, null);
  const latestRate = bills[0]?.rate || household?.rate || 0;
  const previousRate = bills[1]?.rate || latestRate;
  const monthly = useMemo(() => getMonthlyUsage(bills, readings, household?.rate || 0), [bills, readings, household?.rate]);
  const recordedMonths = monthly.filter((item) => item.hasData);
  const currentMonth = recordedMonths[recordedMonths.length - 1];
  const previousMonth = recordedMonths[recordedMonths.length - 2];
  const usageChange = currentMonth && previousMonth?.kwh
    ? Number((((currentMonth.kwh - previousMonth.kwh) / previousMonth.kwh) * 100).toFixed(1))
    : null;
  const rows = bills.filter((bill) => filter === 'all' || bill.status === filter);
  const rates = useMemo(() => bills.slice(0, 6).reverse(), [bills]);
  const rateRange = Math.max(0.01, ...rates.map((bill) => bill.rate)) - Math.min(0, ...rates.map((bill) => bill.rate));

  const handleBillSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const kwh = Number(billForm.kwh);
      const rate = Number(billForm.rate);
      if (!billForm.periodStart || !billForm.periodEnd || billForm.periodEnd < billForm.periodStart || kwh < 0 || rate < 0) {
        throw new Error('Enter a valid billing period, consumption, and rate.');
      }
      await saveBill({
        ...billForm,
        kwh,
        rate,
        estimated: Math.round(kwh * rate),
        actual: billForm.actual,
      });
      toast({ title: 'Bill saved', description: 'Your billing history has been updated.' });
      setEntryType('');
      setBillForm(initialBill(household?.rate));
    } catch (error) {
      console.error('Unable to save bill:', error);
      toast({ title: 'Unable to save bill', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReadingSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (!readingForm.date || Number(readingForm.kwh) < 0) throw new Error('Enter a valid reading date and usage amount.');
      await saveReading(readingForm);
      toast({ title: 'Reading saved', description: `Usage for ${readingForm.date} is recorded.` });
      setEntryType('');
      setReadingForm({ date: todayISO(), kwh: '', cost: '', notes: '' });
    } catch (error) {
      console.error('Unable to save reading:', error);
      toast({ title: 'Unable to save reading', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bill) => {
    if (!window.confirm(`Delete the ${bill.period} bill?`)) return;
    try {
      await deleteBill(bill.id);
      toast({ title: 'Bill deleted', description: bill.period });
    } catch (error) {
      console.error('Unable to delete bill:', error);
      toast({ title: 'Unable to delete bill', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Records"
        title="Consumption & billing history"
        description="Record meter readings and bills, then compare your household's energy use over time."
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setEntryType(entryType === 'reading' ? '' : 'reading')} className="btn-ghost h-10 px-3 text-xs">
              <Zap className="h-4 w-4" /> Add reading
            </button>
            <button type="button" onClick={() => setEntryType(entryType === 'bill' ? '' : 'bill')} className="btn-primary h-10 px-3 text-xs">
              <FilePlus2 className="h-4 w-4" /> Add bill
            </button>
          </div>
        }
      />

      {entryType === 'bill' && (
        <form onSubmit={handleBillSubmit} className="card-surface grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-5">
          <label className="field-label">Period start<input required type="date" value={billForm.periodStart} onChange={(event) => setBillForm({ ...billForm, periodStart: event.target.value })} className="input-base mt-2" /></label>
          <label className="field-label">Period end<input required type="date" value={billForm.periodEnd} onChange={(event) => setBillForm({ ...billForm, periodEnd: event.target.value })} className="input-base mt-2" /></label>
          <label className="field-label">Usage (kWh)<input required type="number" min="0" step="0.001" value={billForm.kwh} onChange={(event) => setBillForm({ ...billForm, kwh: event.target.value })} className="input-base mt-2" /></label>
          <label className="field-label">Rate per kWh<input required type="number" min="0" step="0.0001" value={billForm.rate} onChange={(event) => setBillForm({ ...billForm, rate: event.target.value })} className="input-base mt-2" /></label>
          <label className="field-label">Actual amount (optional)<input type="number" min="0" step="0.01" value={billForm.actual} onChange={(event) => setBillForm({ ...billForm, actual: event.target.value })} className="input-base mt-2" /></label>
          <div className="flex items-center justify-between gap-2 sm:col-span-2 lg:col-span-5">
            <p className="text-xs text-muted-foreground">Estimated total: {formatPeso(Number(billForm.kwh || 0) * Number(billForm.rate || 0))}</p>
            <div className="flex gap-2"><button type="button" onClick={() => setEntryType('')} className="btn-ghost h-9 px-3 text-xs">Cancel</button><button type="submit" disabled={saving} className="btn-primary h-9 px-4 text-xs">{saving ? 'Saving…' : 'Save bill'}</button></div>
          </div>
        </form>
      )}

      {entryType === 'reading' && (
        <form onSubmit={handleReadingSubmit} className="card-surface grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
          <label className="field-label">Reading date<input required type="date" value={readingForm.date} onChange={(event) => setReadingForm({ ...readingForm, date: event.target.value })} className="input-base mt-2" /></label>
          <label className="field-label">Usage (kWh)<input required type="number" min="0" step="0.001" value={readingForm.kwh} onChange={(event) => setReadingForm({ ...readingForm, kwh: event.target.value })} className="input-base mt-2" /></label>
          <label className="field-label">Cost (optional)<input type="number" min="0" step="0.01" value={readingForm.cost} onChange={(event) => setReadingForm({ ...readingForm, cost: event.target.value })} className="input-base mt-2" /></label>
          <label className="field-label">Notes<input value={readingForm.notes} onChange={(event) => setReadingForm({ ...readingForm, notes: event.target.value })} className="input-base mt-2" /></label>
          <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-4"><button type="button" onClick={() => setEntryType('')} className="btn-ghost h-9 px-3 text-xs">Cancel</button><button type="submit" disabled={saving} className="btn-primary h-9 px-4 text-xs">{saving ? 'Saving…' : 'Save reading'}</button></div>
        </form>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Settled total" value={actualBills.length ? formatPeso(totalPaid) : '—'} delta={null} deltaLabel={`${actualBills.length} actual bills`} icon={CircleDollarSign} tone="eco" />
        <StatCard label="Average monthly usage" value={actualBills.length ? avgKwh : '—'} unit={actualBills.length ? 'kWh' : ''} delta={usageChange} deltaLabel="vs previous period" icon={Gauge} tone="lime" delay={60} />
        <StatCard label="Highest bill" value={highest ? formatPeso(highest.actual) : '—'} delta={null} deltaLabel={highest?.period || 'no actual bills yet'} icon={TrendingDown} tone="muted" delay={120} />
        <StatCard label="Current rate" value={latestRate ? formatPeso(latestRate, 2) : '—'} unit="/ kWh" delta={previousRate ? Number((((latestRate - previousRate) / previousRate) * 100).toFixed(1)) : null} deltaLabel={bills.length > 1 ? 'vs previous bill' : 'configured household rate'} icon={CalendarRange} tone="eco" delay={180} />
      </div>

      <ConsumptionBillingChart data={monthly} />

      <section className="card-surface animate-rise overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-5 sm:px-6">
          <div><h2 className="font-heading text-base font-bold">Billing periods</h2><p className="mt-1 text-xs text-muted-foreground">Recorded bills and estimated charges</p></div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
            {FILTERS.map((option) => (
              <button key={option.id} type="button" onClick={() => setFilter(option.id)} className={cn('shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all sm:px-3 sm:text-[11.5px]', filter === option.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{option.label}</button>
            ))}
          </div>
        </div>
        {rows.length ? <BillsTable rows={rows} onDelete={handleDelete} /> : <p className="px-5 pb-6 text-sm text-muted-foreground">No bills for this filter yet. Add a bill to start your history.</p>}
      </section>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <section className="card-surface animate-rise p-5 sm:p-6">
          <h2 className="font-heading text-base font-bold">Recorded electricity rates</h2>
          <p className="mt-1 text-xs text-muted-foreground">Rates captured with each bill</p>
          {rates.length ? <ul className="mt-4 space-y-3">{rates.map((bill) => {
            const width = ((bill.rate - Math.min(...rates.map((item) => item.rate))) / rateRange) * 55 + 45;
            return <li key={bill.id} className="flex items-center gap-3"><span className="w-24 shrink-0 truncate text-[11.5px] font-semibold text-muted-foreground">{bill.period}</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-[#27AE83]" style={{ width: `${width}%` }} /></span><span className="w-16 shrink-0 text-right text-xs font-bold">{formatPeso(bill.rate, 2)}</span></li>;
          })}</ul> : <p className="mt-4 text-sm text-muted-foreground">Rates from recorded bills will appear here.</p>}
        </section>
        <section className="card-surface animate-rise p-5 sm:p-6">
          <h2 className="font-heading text-base font-bold">Period comparison</h2>
          <p className="mt-1 text-xs text-muted-foreground">Latest recorded months</p>
          {recordedMonths.length ? <div className="mt-4 space-y-3">{recordedMonths.slice(-4).reverse().map((month, index) => (
            <div key={`${month.year}-${month.label}`} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3.5 py-3">
              <div><p className="text-[13px] font-semibold">{month.label} {month.year} {index === 0 && <span className="text-[10px] font-bold uppercase text-[#1c8f6b] dark:text-[#4ED0A6]">latest</span>}</p><p className="text-[11px] text-muted-foreground">{month.kwh} kWh recorded</p></div>
              <div className="text-right"><p className="text-[13px] font-bold">{formatPeso(month.cost)}</p><p className="text-[11px] text-muted-foreground">at {formatPeso(month.rate, 2)}/kWh</p></div>
            </div>
          ))}</div> : <p className="mt-4 text-sm text-muted-foreground">Add bills or readings to compare periods.</p>}
        </section>
      </div>

      <section className="card-surface overflow-hidden">
        <div className="px-5 py-5 sm:px-6"><h2 className="font-heading text-base font-bold">Daily meter readings</h2><p className="mt-1 text-xs text-muted-foreground">Most recent entries · saving the same date updates its reading</p></div>
        {readings.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse"><thead><tr><th className="table-head">Date</th><th className="table-head text-right">Usage</th><th className="table-head text-right">Cost</th><th className="table-head">Notes</th></tr></thead><tbody>{readings.slice(0, 14).map((reading) => <tr key={reading.id}><td className="table-cell font-semibold">{reading.date}</td><td className="table-cell text-right">{reading.kwh} kWh</td><td className="table-cell text-right">{reading.cost === null ? '—' : formatPeso(reading.cost)}</td><td className="table-cell text-muted-foreground">{reading.notes || '—'}</td></tr>)}</tbody></table></div> : <p className="px-5 pb-6 text-sm text-muted-foreground">No daily readings yet.</p>}
      </section>
    </div>
  );
}
