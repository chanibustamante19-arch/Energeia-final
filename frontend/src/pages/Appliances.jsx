import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ApplianceCard from '@/components/appliances/ApplianceCard';
import ApplianceModal from '@/components/appliances/ApplianceModal';
import { formatPeso } from '@/lib/energy';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useHouseholdData } from '@/lib/HouseholdDataContext';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active schedules' },
  { id: 'paused', label: 'Paused' },
];

export default function Appliances() {
  const { toast } = useToast();
  const { appliances: items, household, saveAppliance, archiveAppliance } = useHouseholdData();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const totals = useMemo(
    () => ({
      kwh: Math.round(items.reduce((sum, a) => sum + a.kwh, 0)),
      cost: items.reduce((sum, a) => sum + a.cost, 0),
    }),
    [items]
  );

  const visible = items.filter((item) => {
    const hasActive = item.schedules.some((s) => s.status === 'active');
    if (filter === 'active' && !hasActive) return false;
    if (filter === 'paused' && hasActive) return false;
    if (query && !`${item.name} ${item.category} ${item.brand}`.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    return true;
  });

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (appliance) => {
    setEditing(appliance);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      await saveAppliance({ ...data, id: editing?.id });
      toast({ title: editing ? 'Appliance updated' : 'Appliance added', description: `${data.name} is saved to ${household.name}.` });
      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      console.error('Unable to save appliance:', error);
      toast({ title: 'Unable to save appliance', description: error.message, variant: 'destructive' });
    }
  };

  const handleArchive = async (appliance) => {
    try {
      await archiveAppliance(appliance.id);
      toast({ title: 'Appliance archived', description: `${appliance.name} was removed from the active estimate.` });
    } catch (error) {
      console.error('Unable to archive appliance:', error);
      toast({ title: 'Unable to archive appliance', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Load management"
        title="Appliances"
        description="Track household equipment, estimate monthly usage and manage operating schedules."
        actions={
          <button type="button" onClick={openNew} className="btn-primary">
            <Plus className="h-4 w-4" /> Add appliance
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: 'Appliances', value: items.length },
          { label: 'Estimated usage', value: `${totals.kwh} kWh` },
          { label: 'Estimated bill', value: formatPeso(totals.cost) },
          { label: 'Rate applied', value: `${formatPeso(household?.rate || 0, 2)}/kWh` },
        ].map((stat) => (
          <div key={stat.label} className="card-surface px-4 py-3.5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-heading text-lg font-extrabold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className={cn('chip shrink-0', filter === option.id && 'chip-active')}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search appliances"
            className="input-base h-10 pl-9"
            aria-label="Search appliances"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card-surface flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Search className="h-6 w-6" />
          </span>
          <p className="mt-4 font-heading text-base font-bold">No appliances match</p>
          <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
            Try a different filter or search term, or add a new appliance to the household.
          </p>
          <button type="button" onClick={openNew} className="btn-ghost mt-5">
            <Plus className="h-4 w-4" /> Add appliance
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((appliance, index) => (
            <div key={appliance.id} style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}>
              <ApplianceCard appliance={appliance} onEdit={openEdit} onArchive={handleArchive} />
            </div>
          ))}
        </div>
      )}

      <ApplianceModal
        open={modalOpen}
        appliance={editing}
        rate={household?.rate || 0}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}