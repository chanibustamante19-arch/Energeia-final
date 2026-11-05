create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  currency text not null default 'PHP' check (currency ~ '^[A-Z]{3}$'),
  notification_preferences jsonb not null default '{"billReminders":true,"weeklyDigest":true,"savingsTips":false}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  occupants integer not null default 1 check (occupants between 1 and 100),
  property_type text not null default 'Single-family home',
  timezone text not null default 'Asia/Manila',
  address text not null default '',
  city text not null default '',
  postal_code text not null default '',
  country text not null default 'Philippines',
  provider text not null default '',
  provider_account text not null default '',
  meter_number text not null default '',
  billing_cycle_day integer not null default 25 check (billing_cycle_day between 1 and 28),
  electricity_rate numeric(10, 4) not null default 0 check (electricity_rate >= 0),
  rate_type text not null default 'Fixed residential',
  rate_effective_date date,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table public.appliances (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  brand text not null default '',
  category text not null default 'Other',
  icon text not null default 'default',
  wattage numeric(10, 2) not null check (wattage > 0),
  quantity integer not null default 1 check (quantity > 0),
  hours_per_day numeric(5, 2) not null check (hours_per_day between 0 and 24),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appliance_schedules (
  id uuid primary key default gen_random_uuid(),
  appliance_id uuid not null references public.appliances (id) on delete cascade,
  label text not null check (length(trim(label)) between 1 and 120),
  days text[] not null default array['Daily']::text[],
  start_time time not null,
  end_time time not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(days) > 0)
);

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  consumption_kwh numeric(12, 3) not null check (consumption_kwh >= 0),
  rate_per_kwh numeric(10, 4) not null check (rate_per_kwh >= 0),
  estimated_amount numeric(12, 2) not null check (estimated_amount >= 0),
  actual_amount numeric(12, 2) check (actual_amount >= 0),
  status text generated always as (
    case when actual_amount is null then 'estimated' else 'actual' end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (household_id, period_start, period_end)
);

create table public.energy_readings (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  reading_date date not null,
  consumption_kwh numeric(12, 3) not null check (consumption_kwh >= 0),
  cost_amount numeric(12, 2) check (cost_amount >= 0),
  source text not null default 'manual' check (source in ('manual', 'meter', 'import')),
  notes text not null default '',
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (household_id, reading_date)
);

create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  note text not null default '',
  hours_by_appliance jsonb not null default '{}'::jsonb
    check (jsonb_typeof(hours_by_appliance) = 'object'),
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dismissed_insights (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  insight_key text not null,
  dismissed_at timestamptz not null default now(),
  primary key (household_id, user_id, insight_key)
);

create index appliances_household_active_idx
  on public.appliances (household_id, created_at) where archived_at is null;
create index bills_household_period_idx on public.bills (household_id, period_start desc);
create index readings_household_date_idx on public.energy_readings (household_id, reading_date desc);
create index scenarios_household_created_idx on public.scenarios (household_id, created_at desc);
create index household_members_user_idx on public.household_members (user_id, household_id);

create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.household_members
    where household_id = target_household and user_id = auth.uid()
  );
$$;

create or replace function public.is_household_owner(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.household_members
    where household_id = target_household
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.create_default_household()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  household_id uuid;
  display_name text;
begin
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(new.email, '@', 1),
    'My'
  );

  insert into public.profiles (id, full_name)
  values (new.id, display_name)
  on conflict (id) do nothing;

  insert into public.households (name, created_by)
  values (display_name || '''s Home', new.id)
  returning id into household_id;

  insert into public.household_members (household_id, user_id, role)
  values (household_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_default_household();

create or replace function public.create_household(new_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.households (name, created_by)
  values (trim(new_name), auth.uid())
  returning id into new_household_id;

  insert into public.household_members (household_id, user_id, role)
  values (new_household_id, auth.uid(), 'owner');

  return new_household_id;
end;
$$;

grant execute on function public.create_household(text) to authenticated;

create or replace function public.save_household_appliance(
  target_household uuid,
  target_appliance uuid,
  details jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  saved_appliance_id uuid;
  schedule jsonb;
begin
  if not public.is_household_member(target_household) then
    raise exception 'Household access denied';
  end if;

  if target_appliance is null then
    insert into public.appliances (
      household_id, name, brand, category, icon, wattage, quantity, hours_per_day
    )
    values (
      target_household,
      trim(details ->> 'name'),
      coalesce(details ->> 'brand', ''),
      coalesce(details ->> 'category', 'Other'),
      coalesce(details ->> 'icon', 'default'),
      (details ->> 'wattage')::numeric,
      (details ->> 'quantity')::integer,
      (details ->> 'hoursPerDay')::numeric
    )
    returning id into saved_appliance_id;
  else
    update public.appliances
    set name = trim(details ->> 'name'),
        brand = coalesce(details ->> 'brand', ''),
        category = coalesce(details ->> 'category', 'Other'),
        icon = coalesce(details ->> 'icon', 'default'),
        wattage = (details ->> 'wattage')::numeric,
        quantity = (details ->> 'quantity')::integer,
        hours_per_day = (details ->> 'hoursPerDay')::numeric,
        archived_at = null
    where id = target_appliance and household_id = target_household
    returning id into saved_appliance_id;

    if saved_appliance_id is null then
      raise exception 'Appliance not found';
    end if;

    delete from public.appliance_schedules where appliance_id = saved_appliance_id;
  end if;

  for schedule in
    select value from jsonb_array_elements(coalesce(details -> 'schedules', '[]'::jsonb))
  loop
    insert into public.appliance_schedules (
      appliance_id, label, days, start_time, end_time, enabled
    )
    values (
      saved_appliance_id,
      trim(schedule ->> 'label'),
      array[coalesce(schedule ->> 'days', 'Daily')],
      (schedule ->> 'start')::time,
      (schedule ->> 'end')::time,
      coalesce(schedule ->> 'status', 'active') = 'active'
    );
  end loop;

  return saved_appliance_id;
end;
$$;

grant execute on function public.save_household_appliance(uuid, uuid, jsonb) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'households', 'appliances', 'appliance_schedules',
    'bills', 'scenarios'
  ]
  loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name, table_name
    );
  end loop;
end;
$$;

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.appliances enable row level security;
alter table public.appliance_schedules enable row level security;
alter table public.bills enable row level security;
alter table public.energy_readings enable row level security;
alter table public.scenarios enable row level security;
alter table public.dismissed_insights enable row level security;

create policy "Profiles are private to their owner"
  on public.profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Members can read their households"
  on public.households for select to authenticated
  using (public.is_household_member(id));
create policy "Users can create households they own"
  on public.households for insert to authenticated
  with check (created_by = auth.uid());
create policy "Owners can update their households"
  on public.households for update to authenticated
  using (public.is_household_owner(id))
  with check (public.is_household_owner(id));
create policy "Owners can delete their households"
  on public.households for delete to authenticated
  using (public.is_household_owner(id));

create policy "Members can read household membership"
  on public.household_members for select to authenticated
  using (user_id = auth.uid() or public.is_household_owner(household_id));
create policy "Owners can add household members"
  on public.household_members for insert to authenticated
  with check (public.is_household_owner(household_id));
create policy "Owners can remove household members"
  on public.household_members for delete to authenticated
  using (public.is_household_owner(household_id));

create policy "Members can manage household appliances"
  on public.appliances for all to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));
create policy "Members can manage schedules for their appliances"
  on public.appliance_schedules for all to authenticated
  using (exists (
    select 1 from public.appliances a
    where a.id = appliance_id and public.is_household_member(a.household_id)
  ))
  with check (exists (
    select 1 from public.appliances a
    where a.id = appliance_id and public.is_household_member(a.household_id)
  ));
create policy "Members can manage household bills"
  on public.bills for all to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));
create policy "Members can manage household readings"
  on public.energy_readings for all to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id) and created_by = auth.uid());
create policy "Members can manage household scenarios"
  on public.scenarios for all to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id) and created_by = auth.uid());
create policy "Users can manage their dismissed insights"
  on public.dismissed_insights for all to authenticated
  using (user_id = auth.uid() and public.is_household_member(household_id))
  with check (user_id = auth.uid() and public.is_household_member(household_id));

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_household_member(uuid) to authenticated;
grant execute on function public.is_household_owner(uuid) to authenticated;
revoke all on function public.is_household_member(uuid) from public, anon;
revoke all on function public.is_household_owner(uuid) from public, anon;
revoke all on function public.create_default_household() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
