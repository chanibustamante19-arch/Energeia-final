import { ArrowUpRight, CalendarDays, Gauge, Plug, TrendingDown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import UsageTrendCard from '@/components/dashboard/UsageTrendCard';
import BreakdownCard from '@/components/dashboard/BreakdownCard';
import SpendingCard from '@/components/dashboard/SpendingCard';
import RecentBillsCard from '@/components/dashboard/RecentBillsCard';
import SuggestionsCard from '@/components/dashboard/SuggestionsCard';
import { formatPeso, getMonthlyUsage, getWeeklyUsage, greetingFor, today } from '@/lib/energy';
import { useAuth } from '@/lib/AuthContext';
import { useHouseholdData } from '@/lib/HouseholdDataContext';

const localDate = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export default function Dashboard() {
  const { user } = useAuth();
  const { household, profile, appliances, bills, readings, insights } = useHouseholdData();
  const monthly = getMonthlyUsage(bills, readings, household?.rate || 0);
  const weekly = getWeeklyUsage(readings, household?.rate || 0);
  const totalKwh = Math.round(appliances.reduce((sum, item) => sum + item.kwh, 0));
  const estimatedCost = appliances.reduce((sum, item) => sum + item.cost, 0);
  const activeSchedules = appliances.reduce(
    (sum, appliance) => sum + appliance.schedules.filter((schedule) => schedule.status === 'active').length,
    0
  );
  const todayReading = readings.find((reading) => reading.date === localDate(new Date()));
  const recordedMonths = monthly.filter((item) => item.hasData);
  const latestMonth = recordedMonths[recordedMonths.length - 1];
  const previousMonth = recordedMonths[recordedMonths.length - 2];
  const usageChange = latestMonth && previousMonth?.kwh
    ? Number((((latestMonth.kwh - previousMonth.kwh) / previousMonth.kwh) * 100).toFixed(1))
    : null;
  const dailyCosts = weekly.filter((item) => item.hasData).map((item) => item.cost);
  const avgDailyCost = dailyCosts.length ? Math.round(dailyCosts.reduce((sum, value) => sum + value, 0) / dailyCosts.length) : null;
  const userName = profile?.fullName || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={today}
        title={`${greetingFor()}, ${userName}`}
        description={`Your household overview for ${household?.name || 'your home'}. Figures are calculated from your saved records.`}
        actions={
          <>
            <Link to="/scenarios" className="btn-ghost">Plan a scenario</Link>
            <Link to="/appliances" className="btn-primary"><Plug className="h-4 w-4" /> Manage appliances</Link>
          </>
        }
      />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <section className="relative overflow-hidden rounded-[22px] bg-[#101C2C] p-6 text-white sm:p-7 lg:col-span-2">
          <div className="pointer-events-none absolute -right-8 -top-20 h-56 w-56 rounded-full bg-[#B7F34A]/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B7F34A]">
              Monthly appliance estimate
            </span>
            <span className="text-[11px] font-medium text-white/60">
              {household?.provider || 'Provider not set'} · {household?.rate ? `${formatPeso(household.rate, 2)}/kWh` : 'Rate not set'}
            </span>
          </div>
          <div className="relative mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Estimated consumption</p>
              <div className="mt-1.5 flex items-end gap-2">
                <span className="font-heading text-[38px] font-extrabold leading-none tracking-tight">{totalKwh}</span>
                <span className="pb-1 text-sm font-semibold text-white/60">kWh / month</span>
              </div>
              <p className="mt-2 text-[11px] text-white/60">
                {usageChange === null ? 'Add bills or meter readings to see historical change.' : `${Math.abs(usageChange)}% ${usageChange > 0 ? 'higher' : 'lower'} than the previous period.`}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Estimated monthly bill</p>
              <p className="mt-1 font-heading text-[30px] font-extrabold leading-none tracking-tight">{formatPeso(estimatedCost)}</p>
              <p className="mt-3 text-[11px] text-white/55">Based on appliance wattage, runtime and your configured rate.</p>
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap items-center gap-3">
            <Link to="/insights" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#B7F34A] px-4 text-[13px] font-bold text-[#101C2C]">
              See how to save <ArrowUpRight className="h-4 w-4" />
            </Link>
            <span className="text-[11.5px] text-white/50">
              {insights.length ? `${formatPeso(insights.reduce((sum, item) => sum + item.savingCost, 0))} potential monthly savings identified` : 'Add appliances to get usage-specific insights.'}
            </span>
          </div>
        </section>
        <BreakdownCard appliances={appliances} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Today's usage" value={todayReading ? todayReading.kwh : '—'} unit={todayReading ? 'kWh' : ''} delta={null} deltaLabel={todayReading ? 'meter reading' : 'no reading entered'} icon={Zap} tone="lime" />
        <StatCard label="Average daily cost" value={avgDailyCost === null ? '—' : formatPeso(avgDailyCost)} delta={null} deltaLabel="from recent readings" icon={Gauge} tone="eco" delay={60} />
        <StatCard label="Active schedules" value={activeSchedules} unit={`of ${appliances.length} appliances`} delta={null} deltaLabel="enabled schedules" icon={CalendarDays} tone="muted" delay={120} />
        <StatCard label="Current rate" value={household?.rate ? formatPeso(household.rate, 2) : '—'} unit="/ kWh" delta={null} deltaLabel={household?.rate ? household.rateType : 'set a rate in settings'} icon={TrendingDown} tone="eco" delay={180} />
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><UsageTrendCard weekly={weekly} monthly={monthly} /></div>
        <SpendingCard monthly={monthly} />
      </div>
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><RecentBillsCard bills={bills} /></div>
        <SuggestionsCard items={insights} />
      </div>
    </div>
  );
}
