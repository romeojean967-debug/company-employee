-- customers
create policy "customers read" on public.customers for select to authenticated
  using (public.is_admin() or public.is_company_staff(company_id) or user_id = auth.uid());
create policy "customers write" on public.customers for all to authenticated
  using (public.is_admin() or public.is_company_staff(company_id))
  with check (public.is_admin() or public.is_company_staff(company_id));

-- households
create policy "households read" on public.households for select to authenticated
  using (public.is_admin() or public.is_company_staff(company_id)
    or exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "households write" on public.households for all to authenticated
  using (public.is_admin() or public.is_company_staff(company_id))
  with check (public.is_admin() or public.is_company_staff(company_id));

-- vehicles
create policy "vehicles read" on public.vehicles for select to authenticated
  using (public.is_admin() or public.is_company_staff(company_id));
create policy "vehicles write" on public.vehicles for all to authenticated
  using (public.is_admin() or public.is_company_staff(company_id))
  with check (public.is_admin() or public.is_company_staff(company_id));

-- waste types
create policy "waste read" on public.waste_types for select to authenticated
  using (public.is_admin() or public.is_company_staff(company_id) or company_id is null);
create policy "waste write" on public.waste_types for all to authenticated
  using (public.is_admin() or public.is_company_staff(company_id))
  with check (public.is_admin() or public.is_company_staff(company_id));

-- subscriptions
create policy "subs read" on public.subscriptions for select to authenticated
  using (public.is_admin() or public.is_company_staff(company_id)
    or exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "subs write" on public.subscriptions for all to authenticated
  using (public.is_admin() or public.is_company_staff(company_id))
  with check (public.is_admin() or public.is_company_staff(company_id));

-- schedules
create policy "sched read" on public.collection_schedules for select to authenticated
  using (public.is_admin() or public.is_company_staff(company_id)
    or exists (select 1 from public.subscriptions s join public.customers c on c.id = s.customer_id
               where s.id = subscription_id and c.user_id = auth.uid()));
create policy "sched write" on public.collection_schedules for all to authenticated
  using (public.is_admin() or public.is_company_staff(company_id))
  with check (public.is_admin() or public.is_company_staff(company_id));

-- routes
create policy "routes read" on public.routes for select to authenticated
  using (public.is_admin() or public.is_company_staff(company_id) or driver_id = auth.uid());
create policy "routes write" on public.routes for all to authenticated
  using (public.is_admin() or public.is_company_staff(company_id))
  with check (public.is_admin() or public.is_company_staff(company_id));
create policy "drivers update own route" on public.routes for update to authenticated
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());

-- payments
create policy "payments read" on public.payments for select to authenticated
  using (public.is_admin() or public.is_company_staff(company_id)
    or exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "payments staff write" on public.payments for all to authenticated
  using (public.is_admin() or public.is_company_staff(company_id))
  with check (public.is_admin() or public.is_company_staff(company_id));
create policy "customer online payment" on public.payments for insert to authenticated
  with check (exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));

-- receipts
create policy "receipts read" on public.digital_receipts for select to authenticated
  using (public.is_admin() or public.is_company_staff(company_id)
    or exists (select 1 from public.payments p join public.customers c on c.id = p.customer_id
               where p.id = payment_id and c.user_id = auth.uid()));
create policy "receipts write" on public.digital_receipts for all to authenticated
  using (public.is_admin() or public.is_company_staff(company_id))
  with check (public.is_admin() or public.is_company_staff(company_id));

-- reports
create policy "reports read" on public.reports for select to authenticated
  using (public.is_admin() or public.is_company_staff(company_id));
create policy "reports write" on public.reports for all to authenticated
  using (public.is_admin() or public.is_company_staff(company_id))
  with check (public.is_admin() or public.is_company_staff(company_id));
