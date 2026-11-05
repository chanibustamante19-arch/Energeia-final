import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { requireSupabase } from '@/api/supabaseClient';

const HouseholdDataContext = createContext(null);

const ensureData = ({ data, error }) => {
  if (error) throw error;
  return data;
};

const monthlyKwh = (wattage, quantity, hours) =>
  Math.round(((Number(wattage) * Number(quantity) * Number(hours) * 30) / 1000) * 10) / 10;

const mapAppliance = (row, rate) => {
  const schedules = (row.schedules || []).map((schedule) => ({
    id: schedule.id,
    label: schedule.label,
    days: schedule.days?.[0] || 'Daily',
    start: schedule.start_time.slice(0, 5),
    end: schedule.end_time.slice(0, 5),
    status: schedule.enabled ? 'active' : 'paused',
  }));
  const kwh = monthlyKwh(row.wattage, row.quantity, row.hours_per_day);
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    icon: row.icon,
    wattage: Number(row.wattage),
    quantity: row.quantity,
    hoursPerDay: Number(row.hours_per_day),
    kwh,
    cost: Math.round(kwh * rate),
    schedules,
  };
};

const mapBill = (row) => {
  const start = new Date(`${row.period_start}T00:00:00`);
  const end = new Date(`${row.period_end}T00:00:00`);
  return {
    id: row.id,
    period: start.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
    cycle: `${start.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    kwh: Number(row.consumption_kwh),
    rate: Number(row.rate_per_kwh),
    estimated: Number(row.estimated_amount),
    actual: row.actual_amount === null ? null : Number(row.actual_amount),
    status: row.status,
  };
};

const mapHousehold = (row) => ({
  id: row.id,
  name: row.name,
  members: row.occupants,
  type: row.property_type,
  timezone: row.timezone,
  address: row.address,
  city: row.city,
  postal: row.postal_code,
  country: row.country,
  provider: row.provider,
  account: row.provider_account,
  meter: row.meter_number,
  cycleDay: row.billing_cycle_day,
  rate: Number(row.electricity_rate),
  rateType: row.rate_type,
  rateEffective: row.rate_effective_date || '',
});

const makeInsights = (appliances, rate) =>
  appliances
    .filter((appliance) => appliance.hoursPerDay > 1)
    .map((appliance) => {
      const savingKwh = Math.round((appliance.wattage * appliance.quantity * Math.min(1, appliance.hoursPerDay - 1) * 30) / 1000);
      return {
        id: `reduce-runtime-${appliance.id}`,
        applianceId: appliance.id,
        title: `Trim ${appliance.name} runtime by one hour`,
        description: `${appliance.name} is used ${appliance.hoursPerDay} hours a day. Reducing its daily runtime by one hour could save about ${savingKwh} kWh per month.`,
        category: appliance.category,
        impact: savingKwh >= 25 ? 'high' : savingKwh >= 10 ? 'medium' : 'low',
        savingKwh,
        savingCost: Math.round(savingKwh * rate),
        icon: appliance.icon,
      };
    })
    .filter((item) => item.savingKwh > 0)
    .sort((a, b) => b.savingCost - a.savingCost);

export function HouseholdDataProvider({ children }) {
  const [households, setHouseholds] = useState([]);
  const [householdId, setHouseholdId] = useState('');
  const [profile, setProfile] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [bills, setBills] = useState([]);
  const [readings, setReadings] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [dismissedInsightIds, setDismissedInsightIds] = useState([]);
  const [isLoadingHouseholds, setIsLoadingHouseholds] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');
  const client = useMemo(() => requireSupabase(), []);

  const household = households.find((item) => item.id === householdId) || null;

  const loadHouseholds = useCallback(async () => {
    const memberships = ensureData(await client
      .from('household_members')
      .select('role, household:households(*)'));
    if (!memberships?.length) {
      const { error: createError } = await client.rpc('create_household', {
        new_name: 'My Household',
      });
      if (createError) throw createError;
      return loadHouseholds();
    }

    const available = memberships
      .filter((item) => item.household)
      .map((item) => ({ ...mapHousehold(item.household), role: item.role }));
    if (!available.length) {
      throw new Error('No household is available for this account. Confirm the Supabase migrations are applied.');
    }
    setHouseholds(available);
    const storedId = window.localStorage.getItem('energeia-household-id');
    const selected = available.find((item) => item.id === storedId) || available[0];
    setHouseholdId(selected.id);

    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    const userId = userData.user?.id;
    if (userId) {
      const { data: profileRow, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profileError) throw profileError;
      setProfile({
        id: profileRow.id,
        fullName: profileRow.full_name,
        phone: profileRow.phone,
        currency: profileRow.currency,
        notificationPreferences: profileRow.notification_preferences,
        createdAt: profileRow.created_at,
      });
    }
  }, [client]);

  const refresh = useCallback(async () => {
    if (!householdId) return;
    setIsLoadingData(true);
    setError('');
    try {
      const [applianceRows, billRows, readingRows, scenarioRows, dismissedRows] = await Promise.all([
        client.from('appliances').select('*, schedules:appliance_schedules(*)')
          .eq('household_id', householdId).is('archived_at', null).order('created_at'),
        client.from('bills').select('*').eq('household_id', householdId).order('period_start', { ascending: false }),
        client.from('energy_readings').select('*').eq('household_id', householdId).order('reading_date', { ascending: false }),
        client.from('scenarios').select('*').eq('household_id', householdId).order('created_at', { ascending: false }),
        client.from('dismissed_insights').select('insight_key').eq('household_id', householdId),
      ]);
      const rate = household?.rate || 0;
      setAppliances(ensureData(applianceRows).map((row) => mapAppliance(row, rate)));
      setBills(ensureData(billRows).map(mapBill));
      setReadings(ensureData(readingRows).map((row) => ({
        id: row.id,
        date: row.reading_date,
        kwh: Number(row.consumption_kwh),
        cost: row.cost_amount === null ? null : Number(row.cost_amount),
        notes: row.notes,
      })));
      setScenarios(ensureData(scenarioRows).map((row) => ({
        id: row.id,
        name: row.name,
        note: row.note,
        hours: row.hours_by_appliance,
      })));
      setDismissedInsightIds(ensureData(dismissedRows).map((row) => row.insight_key));
    } catch (loadError) {
      console.error('Unable to load household records:', loadError);
      setError(loadError.message || 'Unable to load household data.');
    } finally {
      setIsLoadingData(false);
    }
  }, [client, householdId, household?.rate]);

  useEffect(() => {
    let active = true;
    setIsLoadingHouseholds(true);
    setError('');
    loadHouseholds()
      .catch((loadError) => {
        if (!active) return;
        console.error('Unable to load households:', loadError);
        setError(loadError.message || 'Unable to load households.');
      })
      .finally(() => {
        if (active) setIsLoadingHouseholds(false);
      });
    return () => { active = false; };
  }, [loadHouseholds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectHousehold = useCallback((id) => {
    if (!households.some((item) => item.id === id)) {
      throw new Error('You do not have access to that household.');
    }
    window.localStorage.setItem('energeia-household-id', id);
    setHouseholdId(id);
  }, [households]);

  const createHousehold = useCallback(async (name) => {
    const { data: id, error: createError } = await client.rpc('create_household', { new_name: name.trim() });
    if (createError) throw createError;
    await loadHouseholds();
    window.localStorage.setItem('energeia-household-id', id);
    setHouseholdId(id);
  }, [client, loadHouseholds]);

  const saveAppliance = useCallback(async (appliance) => {
    const { error: saveError } = await client.rpc('save_household_appliance', {
      target_household: householdId,
      target_appliance: appliance.id || null,
      details: {
        name: appliance.name,
        brand: appliance.brand || '',
        category: appliance.category,
        icon: appliance.icon || 'default',
        wattage: appliance.wattage,
        quantity: appliance.quantity,
        hoursPerDay: appliance.hoursPerDay,
        schedules: appliance.schedules.map(({ label, days, start, end, status }) => ({ label, days, start, end, status })),
      },
    });
    if (saveError) throw saveError;
    await refresh();
  }, [client, householdId, refresh]);

  const archiveAppliance = useCallback(async (id) => {
    const { error: archiveError } = await client.from('appliances')
      .update({ archived_at: new Date().toISOString() })
      .eq('household_id', householdId)
      .eq('id', id);
    if (archiveError) throw archiveError;
    await refresh();
  }, [client, householdId, refresh]);

  const saveBill = useCallback(async (bill) => {
    const record = {
      household_id: householdId,
      period_start: bill.periodStart,
      period_end: bill.periodEnd,
      consumption_kwh: Number(bill.kwh),
      rate_per_kwh: Number(bill.rate),
      estimated_amount: Number(bill.estimated),
      actual_amount: bill.actual === '' || bill.actual === null ? null : Number(bill.actual),
    };
    const request = bill.id
      ? client.from('bills').update(record).eq('household_id', householdId).eq('id', bill.id)
      : client.from('bills').insert(record);
    const { error: saveError } = await request;
    if (saveError) throw saveError;
    await refresh();
  }, [client, householdId, refresh]);

  const deleteBill = useCallback(async (id) => {
    const { error: deleteError } = await client.from('bills')
      .delete().eq('household_id', householdId).eq('id', id);
    if (deleteError) throw deleteError;
    await refresh();
  }, [client, householdId, refresh]);

  const saveReading = useCallback(async (reading) => {
    const { error: saveError } = await client.from('energy_readings').upsert({
      household_id: householdId,
      reading_date: reading.date,
      consumption_kwh: Number(reading.kwh),
      cost_amount: reading.cost === '' || reading.cost === null ? null : Number(reading.cost),
      notes: reading.notes || '',
    }, { onConflict: 'household_id,reading_date' });
    if (saveError) throw saveError;
    await refresh();
  }, [client, householdId, refresh]);

  const saveScenario = useCallback(async ({ id, name, note, hours }) => {
    const values = {
      household_id: householdId,
      name: name.trim(),
      note: note || '',
      hours_by_appliance: hours,
    };
    const request = id
      ? client.from('scenarios').update(values).eq('household_id', householdId).eq('id', id)
      : client.from('scenarios').insert(values);
    const { error: saveError } = await request;
    if (saveError) throw saveError;
    await refresh();
  }, [client, householdId, refresh]);

  const deleteScenario = useCallback(async (id) => {
    const { error: deleteError } = await client.from('scenarios')
      .delete().eq('household_id', householdId).eq('id', id);
    if (deleteError) throw deleteError;
    await refresh();
  }, [client, householdId, refresh]);

  const dismissInsight = useCallback(async (insightKey) => {
    const { error: dismissError } = await client.from('dismissed_insights').upsert({
      household_id: householdId,
      insight_key: insightKey,
    }, { onConflict: 'household_id,user_id,insight_key' });
    if (dismissError) throw dismissError;
    await refresh();
  }, [client, householdId, refresh]);

  const restoreInsights = useCallback(async () => {
    const { error: restoreError } = await client.from('dismissed_insights')
      .delete().eq('household_id', householdId);
    if (restoreError) throw restoreError;
    await refresh();
  }, [client, householdId, refresh]);

  const updateHousehold = useCallback(async (changes) => {
    const { error: updateError } = await client.from('households').update({
      name: changes.name,
      occupants: Number(changes.members),
      property_type: changes.type,
      timezone: changes.timezone,
      address: changes.address,
      city: changes.city,
      postal_code: changes.postal,
      country: changes.country,
      provider: changes.provider,
      provider_account: changes.account,
      meter_number: changes.meter,
      billing_cycle_day: Number(changes.cycleDay),
      electricity_rate: Number(changes.rate),
      rate_type: changes.rateType,
      rate_effective_date: changes.rateEffective || null,
    }).eq('id', householdId);
    if (updateError) throw updateError;
    await loadHouseholds();
    await refresh();
  }, [client, householdId, loadHouseholds, refresh]);

  const updateProfile = useCallback(async (changes) => {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    const userId = userData.user?.id;
    if (!userId) throw new Error('Your session has expired. Sign in again.');
    const { error: updateError } = await client.from('profiles').update({
      full_name: changes.fullName,
      phone: changes.phone,
      currency: changes.currency,
      notification_preferences: changes.notificationPreferences,
    }).eq('id', userId);
    if (updateError) throw updateError;
    const { data: profileRow, error: profileError } = await client
      .from('profiles').select('*').eq('id', userId).single();
    if (profileError) throw profileError;
    setProfile({
      id: profileRow.id,
      fullName: profileRow.full_name,
      phone: profileRow.phone,
      currency: profileRow.currency,
      notificationPreferences: profileRow.notification_preferences,
      createdAt: profileRow.created_at,
    });
  }, [client]);

  const insights = useMemo(
    () => makeInsights(appliances, household?.rate || 0),
    [appliances, household?.rate]
  );

  const value = {
    households, household, householdId, profile, appliances, bills, readings, scenarios,
    insights, dismissedInsightIds, isLoadingHouseholds, isLoadingData, error,
    selectHousehold, createHousehold, refresh, saveAppliance, archiveAppliance,
    saveBill, deleteBill, saveReading, saveScenario, deleteScenario, dismissInsight,
    restoreInsights, updateHousehold, updateProfile,
  };

  return (
    <HouseholdDataContext.Provider value={value}>
      {children}
    </HouseholdDataContext.Provider>
  );
}

export function useHouseholdData() {
  const context = useContext(HouseholdDataContext);
  if (!context) throw new Error('useHouseholdData must be used within a HouseholdDataProvider');
  return context;
}
