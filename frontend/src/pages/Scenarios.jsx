import { useState } from 'react';
import { Save } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ScenarioBuilder from '@/components/scenarios/ScenarioBuilder';
import SavedPlans from '@/components/scenarios/SavedPlans';
import { formatPeso, monthlyKwh } from '@/lib/energy';
import { useToast } from '@/components/ui/use-toast';
import { useHouseholdData } from '@/lib/HouseholdDataContext';

export default function Scenarios() {
  const { toast } = useToast();
  const { appliances, household, scenarios: plans, saveScenario, deleteScenario } = useHouseholdData();
  const [adjustments, setAdjustments] = useState({});
  const [name, setName] = useState('');
  const rate = household?.rate || 0;
  const actualKwh = Math.round(appliances.reduce(
    (sum, appliance) => sum + monthlyKwh(appliance.wattage, appliance.quantity, appliance.hoursPerDay),
    0
  ));

  const simKwh = Math.round(
    appliances.reduce((sum, appliance) => {
      const hours = adjustments[appliance.id] !== undefined ? adjustments[appliance.id] : appliance.hoursPerDay;
      return sum + monthlyKwh(appliance.wattage, appliance.quantity, hours);
    }, 0)
  );
  const simCost = Math.round(simKwh * rate);
  const delta = simKwh - actualKwh;

  const change = (id, hours) => setAdjustments((state) => ({ ...state, [id]: hours }));

  const savePlan = async () => {
    if (!name.trim()) {
      toast({ title: 'Name your plan', description: 'Add a short label before saving this scenario.' });
      return;
    }
    try {
      await saveScenario({
        name: name.trim(),
        note: `${delta === 0 ? 'No change' : `${delta > 0 ? '+' : ''}${delta} kWh vs current appliance estimate`}`,
        hours: { ...adjustments },
      });
      toast({ title: 'Scenario saved', description: `"${name.trim()}" is ready to load again.` });
      setName('');
    } catch (error) {
      console.error('Unable to save scenario:', error);
      toast({ title: 'Unable to save scenario', description: error.message, variant: 'destructive' });
    }
  };

  const loadPlan = (plan) => {
    setAdjustments({ ...plan.hours });
    toast({ title: 'Scenario loaded', description: `${plan.name} is now on the canvas.` });
  };

  const deletePlan = async (plan) => {
    try {
      await deleteScenario(plan.id);
      toast({ title: 'Scenario removed', description: plan.name });
    } catch (error) {
      console.error('Unable to delete scenario:', error);
      toast({ title: 'Unable to delete scenario', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="What-if planning"
        title="Scenarios"
        description="Model schedule changes against your household estimate. Saved plans never change actual appliance usage."
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Actual</span>
            <span className="text-[13px] font-bold">{actualKwh} kWh</span>
          </div>
        }
      />

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.4fr_1fr]">
        <ScenarioBuilder
          appliances={appliances}
          baseline={actualKwh}
          rate={rate}
          adjustments={adjustments}
          onChange={change}
          onReset={() => setAdjustments({})}
          simKwh={simKwh}
          simCost={simCost}
        />

        <div className="space-y-4 sm:space-y-5">
          <section className="card-surface animate-rise p-5 sm:p-6">
            <h2 className="font-heading text-base font-bold">Save this scenario</h2>
            <p className="mt-1 text-xs text-muted-foreground">Keep the current canvas for later comparison</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cooler nights plan"
                className="input-base h-10"
                aria-label="Scenario name"
              />
              <button type="button" onClick={savePlan} className="btn-primary h-10 shrink-0 px-4">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Change</p>
                <p className="mt-0.5 text-[15px] font-extrabold">
                  {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta} kWh`}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Bill impact</p>
                <p className="mt-0.5 text-[15px] font-extrabold">
                  {delta === 0 ? '—' : formatPeso(Math.round(delta * rate))}
                </p>
              </div>
            </div>
          </section>

          <SavedPlans plans={plans} appliances={appliances} rate={rate} onLoad={loadPlan} onDelete={deletePlan} />
        </div>
      </div>
    </div>
  );
}