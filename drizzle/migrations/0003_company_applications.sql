create table if not exists public.company_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text not null,
  email text not null,
  phone text,
  company_name text not null,
  province text,
  district text,
  sector text,
  cell text,
  street text,
  building text,
  description text,
  office_phone text,
  rdb_registered boolean not null default false,
  rdb_certificate_number text,
  document_path text,
  document_kind text,
  terms_accepted_at timestamptz,
  status text not null default 'pending',
  review_note text,
  reviewed_at timestamptz,
  company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.company_applications to authenticated;
grant all on public.company_applications to service_role;
alter table public.company_applications enable row level security;

drop policy if exists "Admins manage applications" on public.company_applications;
create policy "Admins manage applications" on public.company_applications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Applicants read own application" on public.company_applications;
create policy "Applicants read own application" on public.company_applications
  for select to authenticated using (user_id = auth.uid());

alter table public.profiles add column if not exists terms_accepted_at timestamptz;