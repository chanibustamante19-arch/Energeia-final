import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { formatPeso, monthlyKwh } from '@/lib/energy';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Cooling', 'Kitchen', 'Laundry', 'Entertainment', 'Bath', 'Work', 'Lighting'];

const EMPTY = {
  name: '',
  brand: '',
  category: 'Cooling',
  icon: 'default',
  wattage: '',
  quantity: 1,
  hoursPerDay: '',
  schedules: [],
};

const EMPTY_ERRORS = { name: '', wattage: '', quantity: '', hoursPerDay: '' };

function SectionTitle({ children }) {
  return (
    <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{children}</p>
  );
}

export default function ApplianceModal({ open, appliance, onClose, onSave, rate = 0 }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState(EMPTY_ERRORS);

  useEffect(() => {
    if (!open) return;
    setErrors(EMPTY_ERRORS);
    setForm(
      appliance
        ? {
            ...appliance,
            wattage: String(appliance.wattage),
            hoursPerDay: String(appliance.hoursPerDay),
            schedules: [...appliance.schedules],
          }
        : { ...EMPTY, schedules: [] }
    );
  }, [open, appliance]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateSchedule = (index, patch) =>
    setForm((f) => ({
      ...f,
      schedules: f.schedules.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));

  const kwh = monthlyKwh(Number(form.wattage) || 0, Number(form.quantity) || 0, Number(form.hoursPerDay) || 0);

  const submit = (event) => {
    event.preventDefault();
    const next = { ...EMPTY_ERRORS };
    if (!form.name.trim()) next.name = 'Give this appliance a name.';
    if (!Number(form.wattage) || Number(form.wattage) <= 0) next.wattage = 'Enter the rated wattage in watts.';
    if (!Number(form.quantity) || Number(form.quantity) < 1) next.quantity = 'Quantity must be at least 1.';
    if (!Number(form.hoursPerDay) || Number(form.hoursPerDay) <= 0 || Number(form.hoursPerDay) > 24) {
      next.hoursPerDay = 'Enter a value between 0.1 and 24 hours.';
    }
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    onSave({
      ...form,
      name: form.name.trim(),
      wattage: Number(form.wattage),
      quantity: Number(form.quantity),
      hoursPerDay: Number(form.hoursPerDay),
      kwh,
      cost: Math.round(kwh * rate),
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#101C2C]/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label={appliance ? 'Edit appliance' : 'Add appliance'}
            className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[24px] border border-border bg-card shadow-2xl sm:max-w-lg sm:rounded-[24px]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
              <div>
                <h2 className="font-heading text-lg font-bold">{appliance ? 'Edit appliance' : 'Add appliance'}</h2>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Estimates update from wattage, quantity and daily runtime.
                </p>
              </div>
              <button type="button" onClick={onClose} className="btn-icon" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form id="appliance-form" onSubmit={submit} className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <div>
                <SectionTitle>Appliance details</SectionTitle>
                <div className="space-y-3.5">
                  <div>
                    <label className="field-label" htmlFor="ap-name">Name</label>
                    <input
                      id="ap-name"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="e.g. Split Air Conditioner"
                      className={cn('input-base', errors.name && 'input-error')}
                    />
                    {errors.name && <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="field-label" htmlFor="ap-brand">Brand / model</label>
                      <input
                        id="ap-brand"
                        value={form.brand}
                        onChange={(e) => update('brand', e.target.value)}
                        placeholder="Optional"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="ap-category">Category</label>
                      <select
                        id="ap-category"
                        value={form.category}
                        onChange={(e) => update('category', e.target.value)}
                        className="input-base"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle>Usage</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="field-label" htmlFor="ap-wattage">Watts</label>
                    <input
                      id="ap-wattage"
                      type="number"
                      inputMode="decimal"
                      min="1"
                      value={form.wattage}
                      onChange={(e) => update('wattage', e.target.value)}
                      placeholder="1100"
                      className={cn('input-base', errors.wattage && 'input-error')}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="ap-qty">Quantity</label>
                    <input
                      id="ap-qty"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => update('quantity', e.target.value)}
                      className={cn('input-base', errors.quantity && 'input-error')}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="ap-hours">Hours / day</label>
                    <input
                      id="ap-hours"
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0.1"
                      max="24"
                      value={form.hoursPerDay}
                      onChange={(e) => update('hoursPerDay', e.target.value)}
                      placeholder="6"
                      className={cn('input-base', errors.hoursPerDay && 'input-error')}
                    />
                  </div>
                </div>
                {(errors.wattage || errors.hoursPerDay || errors.quantity) && (
                  <p className="mt-2 text-[11.5px] font-semibold text-destructive">
                    {errors.wattage || errors.hoursPerDay || errors.quantity}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/70 px-3.5 py-2.5">
                  <span className="text-[11.5px] font-semibold text-muted-foreground">Live estimate</span>
                  <span className="text-[12.5px] font-bold">
                    {kwh.toLocaleString('en-PH', { maximumFractionDigits: 1 })} kWh · {formatPeso(kwh * rate)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <SectionTitle>Schedules</SectionTitle>
                  <button
                    type="button"
                    onClick={() =>
                      update('schedules', [
                        ...form.schedules,
                        {
                          id: `s-${Date.now()}`,
                          label: 'New schedule',
                          days: 'Daily',
                          start: '18:00',
                          end: '20:00',
                          status: 'active',
                        },
                      ])
                    }
                    className="mb-3 inline-flex items-center gap-1 text-[11.5px] font-bold text-[#1c8f6b] dark:text-[#4ED0A6]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>

                {form.schedules.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-3.5 py-4 text-center text-[12px] text-muted-foreground">
                    No schedules yet — this appliance is treated as always available.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {form.schedules.map((schedule, index) => (
                      <li key={schedule.id} className="rounded-xl border border-border/70 p-2.5">
                        <div className="flex items-center gap-2">
                          <input
                            value={schedule.label}
                            onChange={(e) => updateSchedule(index, { label: e.target.value })}
                            className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-card px-2 text-[12.5px] font-medium"
                            aria-label="Schedule label"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateSchedule(index, {
                                status: schedule.status === 'active' ? 'paused' : 'active',
                              })
                            }
                            className={cn(
                              'shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors',
                              schedule.status === 'active'
                                ? 'bg-[#27AE83]/15 text-[#1c8f6b] dark:text-[#4ED0A6]'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {schedule.status}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              update('schedules', form.schedules.filter((_, i) => i !== index))
                            }
                            className="btn-icon h-7 w-7"
                            aria-label="Remove schedule"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <select
                            value={schedule.days}
                            onChange={(e) => updateSchedule(index, { days: e.target.value })}
                            className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-card px-2 text-[12px]"
                            aria-label="Schedule days"
                          >
                            {['Daily', 'Mon – Fri', 'Sat – Sun', 'Mon – Sat', 'Wed', 'Sat'].map((day) => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                          <input
                            type="time"
                            value={schedule.start}
                            onChange={(e) => updateSchedule(index, { start: e.target.value })}
                            className="h-8 rounded-lg border border-input bg-card px-2 text-[12px]"
                            aria-label="Start time"
                          />
                          <span className="text-[11px] text-muted-foreground">to</span>
                          <input
                            type="time"
                            value={schedule.end}
                            onChange={(e) => updateSchedule(index, { end: e.target.value })}
                            className="h-8 rounded-lg border border-input bg-card px-2 text-[12px]"
                            aria-label="End time"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </form>

            <div className="flex items-center gap-2 border-t border-border/70 px-5 py-4">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" form="appliance-form" className="btn-primary flex-1">
                {appliance ? 'Save changes' : 'Add appliance'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}