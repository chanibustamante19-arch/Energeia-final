import { useEffect, useState } from 'react';
import { Building2, Gauge, Lock, MapPin, Moon, Palette, Shield, Sun, User } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SettingsSection from '@/components/settings/SettingsSection';
import Field from '@/components/settings/Field';
import Toggle from '@/components/settings/Toggle';
import { PROVIDERS, formatPeso, monthlyKwh } from '@/lib/energy';
import { useAuth } from '@/lib/AuthContext';
import { useHouseholdData } from '@/lib/HouseholdDataContext';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/components/ui/use-toast';

const EMPTY_HOUSEHOLD = {
  name: '', members: '1', timezone: 'Asia/Manila', type: 'Single-family home',
  address: '', city: '', postal: '', country: 'Philippines',
  provider: '', account: '', meter: '', cycleDay: '25',
  rate: '0', rateType: 'Fixed residential', rateEffective: '',
};

const SETTINGS_SECTIONS = [
  { id: 'account', label: 'Account profile', icon: User },
  { id: 'household', label: 'Household', icon: Building2 },
  { id: 'location', label: 'Home location', icon: MapPin },
  { id: 'provider', label: 'Provider', icon: Building2 },
  { id: 'rate', label: 'Electricity rate', icon: Gauge },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'privacy', label: 'Privacy & access', icon: Shield },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, signOutEverywhere } = useAuth();
  const { toast } = useToast();
  const {
    profile, household, households, appliances, updateProfile, updateHousehold, createHousehold,
  } = useHouseholdData();
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [preferences, setPreferences] = useState({ billReminders: true, weeklyDigest: true, savingsTips: false });
  const [houseForm, setHouseForm] = useState(EMPTY_HOUSEHOLD);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [saving, setSaving] = useState('');

  useEffect(() => {
    if (profile) {
      setProfileForm({ fullName: profile.fullName || '', phone: profile.phone || '' });
      setPreferences({
        billReminders: profile.notificationPreferences?.billReminders ?? true,
        weeklyDigest: profile.notificationPreferences?.weeklyDigest ?? true,
        savingsTips: profile.notificationPreferences?.savingsTips ?? false,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!household) return;
    setHouseForm({
      name: household.name,
      members: String(household.members),
      timezone: household.timezone,
      type: household.type,
      address: household.address,
      city: household.city,
      postal: household.postal,
      country: household.country,
      provider: household.provider,
      account: household.account,
      meter: household.meter,
      cycleDay: String(household.cycleDay),
      rate: String(household.rate),
      rateType: household.rateType,
      rateEffective: household.rateEffective,
    });
  }, [household]);

  const runSave = async (label, action) => {
    setSaving(label);
    try {
      await action();
      toast({ title: `${label} saved`, description: 'Your changes are saved to your Supabase account.' });
    } catch (error) {
      console.error(`Unable to save ${label.toLowerCase()}:`, error);
      toast({ title: `Unable to save ${label.toLowerCase()}`, description: error.message, variant: 'destructive' });
    } finally {
      setSaving('');
    }
  };

  const saveProfile = () => runSave('Profile', () => updateProfile({
    ...profileForm,
    currency: profile?.currency || 'PHP',
    notificationPreferences: preferences,
  }));
  const saveHousehold = () => runSave('Household', () => updateHousehold(houseForm));
  const estimatedKwh = appliances.reduce(
    (sum, appliance) => sum + monthlyKwh(appliance.wattage, appliance.quantity, appliance.hoursPerDay),
    0
  );

  const handleCreateHousehold = async (event) => {
    event.preventDefault();
    if (!newHouseholdName.trim()) return;
    await runSave('Household', async () => {
      await createHousehold(newHouseholdName.trim());
      setNewHouseholdName('');
    });
  };

  const handleSignOutEverywhere = async () => {
    await runSave('Sign out', signOutEverywhere);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Manage your profile, household, provider and billing settings."
      />

      <div className="grid gap-5 lg:grid-cols-[210px_1fr]">
        <nav className="hidden lg:block">
          <ul className="sticky top-24 space-y-1">
            {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id}><a href={`#${id}`} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-semibold text-muted-foreground hover:bg-card hover:text-foreground"><Icon className="h-4 w-4" />{label}</a></li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-4 sm:space-y-5">
          <SettingsSection
            id="account"
            icon={User}
            title="Account profile"
            description="Your Google sign-in email and contact details."
            footer={<><p className="truncate text-[11px] text-muted-foreground">{user?.email}</p><button type="button" disabled={saving === 'Profile'} onClick={saveProfile} className="btn-primary h-9 px-4 text-[12.5px]">{saving === 'Profile' ? 'Saving…' : 'Save profile'}</button></>}
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="profile-name"><input id="profile-name" value={profileForm.fullName} onChange={(event) => setProfileForm({ ...profileForm, fullName: event.target.value })} className="input-base" /></Field>
              <Field label="Email address" htmlFor="profile-email"><input id="profile-email" type="email" value={user?.email || ''} readOnly className="input-base opacity-70" /></Field>
              <Field label="Mobile number" htmlFor="profile-phone" hint="Optional contact number."><input id="profile-phone" value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} className="input-base" /></Field>
            </div>
          </SettingsSection>

          <SettingsSection
            id="household"
            icon={Building2}
            title="Household"
            description="Create separate homes and manage their usage independently."
            footer={<><p className="text-[11px] text-muted-foreground">{households.length} household{households.length === 1 ? '' : 's'} available</p><button type="button" disabled={saving === 'Household' || household?.role !== 'owner'} onClick={saveHousehold} className="btn-primary h-9 px-4 text-[12.5px]">{saving === 'Household' ? 'Saving…' : 'Save household'}</button></>}
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Household name" htmlFor="household-name"><input id="household-name" value={houseForm.name} onChange={(event) => setHouseForm({ ...houseForm, name: event.target.value })} className="input-base" /></Field>
              <Field label="Occupants" htmlFor="household-members"><input id="household-members" type="number" min="1" max="100" value={houseForm.members} onChange={(event) => setHouseForm({ ...houseForm, members: event.target.value })} className="input-base" /></Field>
              <Field label="Property type" htmlFor="household-type"><select id="household-type" value={houseForm.type} onChange={(event) => setHouseForm({ ...houseForm, type: event.target.value })} className="input-base"><option>Single-family home</option><option>Condominium unit</option><option>Townhouse</option><option>Boarding house</option></select></Field>
              <Field label="Timezone" htmlFor="household-timezone"><select id="household-timezone" value={houseForm.timezone} onChange={(event) => setHouseForm({ ...houseForm, timezone: event.target.value })} className="input-base"><option value="Asia/Manila">Asia/Manila (PHT)</option><option value="Asia/Singapore">Asia/Singapore (SGT)</option><option value="UTC">UTC</option></select></Field>
            </div>
            {household?.role !== 'owner' && <p className="mt-3 text-xs text-muted-foreground">Only the household owner can edit these settings.</p>}
            <form onSubmit={handleCreateHousehold} className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row">
              <input value={newHouseholdName} onChange={(event) => setNewHouseholdName(event.target.value)} placeholder="Name another home" className="input-base" aria-label="New household name" />
              <button type="submit" disabled={!newHouseholdName.trim() || saving === 'Household'} className="btn-ghost h-11 shrink-0 px-4">Add household</button>
            </form>
          </SettingsSection>

          <SettingsSection id="location" icon={MapPin} title="Home location" description="Keep an address with each household.">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Street address" htmlFor="location-address" className="sm:col-span-2"><input id="location-address" value={houseForm.address} onChange={(event) => setHouseForm({ ...houseForm, address: event.target.value })} className="input-base" /></Field>
              <Field label="City" htmlFor="location-city"><input id="location-city" value={houseForm.city} onChange={(event) => setHouseForm({ ...houseForm, city: event.target.value })} className="input-base" /></Field>
              <Field label="Postal code" htmlFor="location-postal"><input id="location-postal" value={houseForm.postal} onChange={(event) => setHouseForm({ ...houseForm, postal: event.target.value })} className="input-base" /></Field>
              <Field label="Country" htmlFor="location-country"><select id="location-country" value={houseForm.country} onChange={(event) => setHouseForm({ ...houseForm, country: event.target.value })} className="input-base"><option>Philippines</option><option>Singapore</option><option>Indonesia</option><option>Other</option></select></Field>
            </div>
            <div className="mt-4 flex justify-end"><button type="button" disabled={saving === 'Household' || household?.role !== 'owner'} onClick={saveHousehold} className="btn-primary h-9 px-4 text-[12.5px]">Save location</button></div>
          </SettingsSection>

          <SettingsSection id="provider" icon={Building2} title="Electricity provider" description="Provider account details are stored privately with this household.">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Provider" htmlFor="provider-name"><select id="provider-name" value={houseForm.provider} onChange={(event) => setHouseForm({ ...houseForm, provider: event.target.value })} className="input-base"><option value="">Select provider</option>{PROVIDERS.map((item) => <option key={item.id} value={item.name}>{item.name} — {item.region}</option>)}</select></Field>
              <Field label="Billing cycle day" htmlFor="provider-cycle"><input id="provider-cycle" type="number" min="1" max="28" value={houseForm.cycleDay} onChange={(event) => setHouseForm({ ...houseForm, cycleDay: event.target.value })} className="input-base" /></Field>
              <Field label="Account number" htmlFor="provider-account"><input id="provider-account" value={houseForm.account} onChange={(event) => setHouseForm({ ...houseForm, account: event.target.value })} className="input-base" /></Field>
              <Field label="Meter number" htmlFor="provider-meter"><input id="provider-meter" value={houseForm.meter} onChange={(event) => setHouseForm({ ...houseForm, meter: event.target.value })} className="input-base" /></Field>
            </div>
            <div className="mt-4 flex justify-end"><button type="button" disabled={saving === 'Household' || household?.role !== 'owner'} onClick={saveHousehold} className="btn-primary h-9 px-4 text-[12.5px]">Save provider</button></div>
          </SettingsSection>

          <SettingsSection id="rate" icon={Gauge} title="Electricity rate" description="Used for appliance cost estimates and unpriced meter readings.">
            <div className="grid gap-3.5 sm:grid-cols-3">
              <Field label="Rate (₱ / kWh)" htmlFor="rate-value"><input id="rate-value" type="number" min="0" step="0.0001" value={houseForm.rate} onChange={(event) => setHouseForm({ ...houseForm, rate: event.target.value })} className="input-base" /></Field>
              <Field label="Rate structure" htmlFor="rate-type"><select id="rate-type" value={houseForm.rateType} onChange={(event) => setHouseForm({ ...houseForm, rateType: event.target.value })} className="input-base"><option>Fixed residential</option><option>Tiered residential</option><option>Time-of-use</option></select></Field>
              <Field label="Effective date" htmlFor="rate-date"><input id="rate-date" type="date" value={houseForm.rateEffective} onChange={(event) => setHouseForm({ ...houseForm, rateEffective: event.target.value })} className="input-base" /></Field>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Estimated monthly cost at current appliance usage: {formatPeso(Number(houseForm.rate || 0) * estimatedKwh)}.</p>
            <div className="mt-4 flex justify-end"><button type="button" disabled={saving === 'Household' || household?.role !== 'owner'} onClick={saveHousehold} className="btn-primary h-9 px-4 text-[12.5px]">Save rate</button></div>
          </SettingsSection>

          <SettingsSection id="preferences" icon={Palette} title="Appearance & notifications" description="Appearance is saved on this device; notification preferences are stored in your profile.">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3.5">
              <div><p className="text-[13px] font-semibold">Theme</p><p className="text-[11.5px] text-muted-foreground">Light or dark across the app.</p></div>
              <div className="flex rounded-xl bg-muted p-1">
                <button type="button" onClick={() => setTheme('light')} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold ${theme === 'light' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}><Sun className="h-3.5 w-3.5" /> Light</button>
                <button type="button" onClick={() => setTheme('dark')} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold ${theme === 'dark' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}><Moon className="h-3.5 w-3.5" /> Dark</button>
              </div>
            </div>
            <ul className="mt-3 divide-y divide-border/60">
              {[
                { key: 'billReminders', label: 'Bill reminders', hint: 'Preference for upcoming bill notifications.' },
                { key: 'weeklyDigest', label: 'Weekly digest', hint: 'Preference for a weekly energy summary.' },
                { key: 'savingsTips', label: 'Savings tips', hint: 'Preference for new energy recommendations.' },
              ].map((item) => <li key={item.key} className="flex items-center justify-between gap-3 py-3"><div><p className="text-[13px] font-semibold">{item.label}</p><p className="text-[11.5px] text-muted-foreground">{item.hint}</p></div><Toggle checked={preferences[item.key]} onChange={(value) => setPreferences({ ...preferences, [item.key]: value })} label={item.label} /></li>)}
            </ul>
            <div className="mt-4 flex justify-end"><button type="button" disabled={saving === 'Profile'} onClick={saveProfile} className="btn-primary h-9 px-4 text-[12.5px]">Save preferences</button></div>
          </SettingsSection>

          <SettingsSection id="privacy" icon={Lock} title="Privacy & account access" description="Authentication and account security are managed by Google.">
            <div className="rounded-xl border border-border/70 p-3.5">
              <p className="text-[13px] font-semibold">Google account security</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">Manage password, multi-factor authentication and connected devices through Google.</p>
              <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="btn-ghost mt-3 h-9 px-3 text-[12px]">Open Google security</a>
            </div>
            <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/[0.04] p-3.5">
              <p className="text-[12.5px] font-semibold">Sign out all devices</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">Revokes all active Energeia sessions for this account.</p>
              <button type="button" onClick={handleSignOutEverywhere} className="mt-2 text-[12px] font-bold text-destructive hover:underline">Sign out everywhere</button>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
