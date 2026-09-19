-- ROLES
create type public.app_role as enum ('admin','company_admin','employee','driver','customer');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text,
  address text,
  phone text,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.companies to authenticated;
grant select on public.companies to anon;
grant all on public.companies to service_role;
alter table public.companies enable row level security;

create table public.profiles (
  id uuid primary key,
  full_name text not null default '',
  email text,
  phone text,
  company_id uuid references public.companies(id) on delete set null,
  position text,
  hire_date date,
  license_number text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;

create or replace function public.current_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_company_staff(_company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select _company_id is not null and _company_id = public.current_company_id()
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email, new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'customer'))
  on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- LOCATIONS
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  district text not null,
  sector text,
  cell text,
  village text,
  latitude numeric,
  longitude numeric
);
grant select, insert, update, delete on public.locations to authenticated;
grant select on public.locations to anon;
grant all on public.locations to service_role;
alter table public.locations enable row level security;

-- CUSTOMERS
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  location_id uuid references public.locations(id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;

create table public.households (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  address text,
  location_id uuid references public.locations(id) on delete set null,
  household_type text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.households to authenticated;
grant all on public.households to service_role;
alter table public.households enable row level security;

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  plate_number text not null,
  type text,
  capacity text,
  driver_id uuid,
  status text not null default 'active'
);
grant select, insert, update, delete on public.vehicles to authenticated;
grant all on public.vehicles to service_role;
alter table public.vehicles enable row level security;

create table public.waste_types (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  description text,
  category text
);
grant select, insert, update, delete on public.waste_types to authenticated;
grant all on public.waste_types to service_role;
alter table public.waste_types enable row level security;

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  plan_type text not null default 'monthly',
  amount numeric not null default 0,
  start_date date not null default current_date,
  end_date date,
  status text not null default 'active'
);
grant select, insert, update, delete on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;

create table public.collection_schedules (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  collection_date date not null,
  time_slot text,
  status text not null default 'scheduled',
  notes text
);
grant select, insert, update, delete on public.collection_schedules to authenticated;
grant all on public.collection_schedules to service_role;
alter table public.collection_schedules enable row level security;

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  driver_id uuid,
  schedule_id uuid references public.collection_schedules(id) on delete set null,
  waste_type_id uuid references public.waste_types(id) on delete set null,
  route_name text not null,
  start_time timestamptz,
  end_time timestamptz,
  status text not null default 'planned'
);
grant select, insert, update, delete on public.routes to authenticated;
grant all on public.routes to service_role;
alter table public.routes enable row level security;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount numeric not null default 0,
  payment_method text not null default 'cash',
  transaction_reference text,
  payment_date timestamptz not null default now(),
  period text,
  status text not null default 'paid',
  recorded_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;

create table public.digital_receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  qr_code text,
  barcode text,
  issued_at timestamptz not null default now(),
  status text not null default 'issued'
);
grant select, insert, update, delete on public.digital_receipts to authenticated;
grant all on public.digital_receipts to service_role;
alter table public.digital_receipts enable row level security;

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  report_type text not null,
  period text,
  summary jsonb,
  generated_at timestamptz not null default now(),
  generated_by uuid
);
grant select, insert, update, delete on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;

-- POLICIES
create policy "public read companies" on public.companies for select using (true);
create policy "admins manage companies" on public.companies for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "company staff update own company" on public.companies for update to authenticated using (public.is_company_staff(id)) with check (public.is_company_staff(id));

create policy "own profile read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin() or public.is_company_staff(company_id));
create policy "own profile update" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin() or public.is_company_staff(company_id))
  with check (id = auth.uid() or public.is_admin() or public.is_company_staff(company_id));
create policy "admins insert profiles" on public.profiles for insert to authenticated
  with check (public.is_admin() or public.is_company_staff(company_id));
create policy "admins delete profiles" on public.profiles for delete to authenticated using (public.is_admin());

create policy "read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "read locations" on public.locations for select using (true);
create policy "staff manage locations" on public.locations for all to authenticated
  using (public.is_admin() or public.current_company_id() is not null)
  with check (public.is_admin() or public.current_company_id() is not null);
