import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Users,
  Wallet,
  Truck,
  AlertTriangle,
  CalendarClock,
  UserCog,
  Route as RouteIcon,
  Receipt,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/queries";
import { roleLabels, useProfile } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Isuku Route System" },
      { name: "description", content: "Your Isuku Route System workspace overview." },
      { property: "og:title", content: "Dashboard — Isuku Route System" },
      { property: "og:description", content: "Your Isuku Route System workspace overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Payment = { amount: number | null; status: string | null; payment_date: string | null };

function useDashboardData(companyId: string | null, scoped: boolean) {
  return useQuery({
    queryKey: ["dashboard", companyId, scoped],
    queryFn: async () => {
      const paymentsQuery = supabase.from("payments").select("amount, status, payment_date");
      const [companies, customers, payments, routes, schedules, subs, staff, vehicles] =
        await Promise.all([
          supabase.from("companies").select("id, name, status, created_at"),
          supabase.from("customers").select("id", { count: "exact", head: true }),
          scoped && companyId ? paymentsQuery.eq("company_id", companyId) : paymentsQuery,
          supabase
            .from("routes")
            .select("id, route_name, status, start_time")
            .order("start_time", { ascending: false, nullsFirst: false })
            .limit(6),
          supabase
            .from("collection_schedules")
            .select("id, collection_date, time_slot, status")
            .order("collection_date", { ascending: false })
            .limit(6),
          supabase.from("subscriptions").select("id, amount, status"),
          supabase.from("profiles").select("id, full_name, position, status"),
          supabase.from("vehicles").select("id, plate_number, status"),
        ]);

      const rows = (payments.data ?? []) as Payment[];
      const paid = rows.filter((p) => p.status === "paid");
      const pending = rows.filter((p) => p.status !== "paid");
      const revenue = paid.reduce((s, p) => s + Number(p.amount ?? 0), 0);
      const outstanding = pending.reduce((s, p) => s + Number(p.amount ?? 0), 0);

      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthRevenue = paid
        .filter((p) => (p.payment_date ?? "").startsWith(thisMonth))
        .reduce((s, p) => s + Number(p.amount ?? 0), 0);

      const scheduleRows = schedules.data ?? [];

      return {
        companies: companies.data ?? [],
        customers: customers.count ?? 0,
        revenue,
        monthRevenue,
        outstanding,
        paidCount: paid.length,
        pendingCount: pending.length,
        routes: routes.data ?? [],
        schedules: scheduleRows,
        doneToday: scheduleRows.filter(
          (s) => s.status === "completed" && s.collection_date === new Date().toISOString().slice(0, 10),
        ).length,
        activeSubs: (subs.data ?? []).filter((s) => s.status === "active").length,
        staff: staff.data ?? [],
        vehicles: vehicles.data ?? [],
      };
    },
  });
}

function Panel({
  title,
  to,
  children,
}: {
  title: string;
  to?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display font-semibold">{title}</h2>
        {to ? (
          <Button asChild size="sm" variant="ghost">
            <Link to={to}>
              View all <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}

function RoutesPanel({ routes }: { routes: { id: string; route_name: string; status: string }[] }) {
  return (
    <Panel title="Latest routes" to="/operations">
      {routes.length ? (
        <ul className="space-y-3 text-sm">
          {routes.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                {r.route_name}
              </span>
              <Badge variant="outline">{r.status}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <Empty text="No routes recorded yet." />
      )}
    </Panel>
  );
}

function SchedulesPanel({
  schedules,
}: {
  schedules: { id: string; collection_date: string; time_slot: string | null; status: string }[];
}) {
  return (
    <Panel title="Recent collections" to="/operations">
      {schedules.length ? (
        <ul className="space-y-3 text-sm">
          {schedules.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {s.collection_date} · {s.time_slot ?? "any time"}
              </span>
              <Badge variant={s.status === "completed" ? "default" : "outline"}>{s.status}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <Empty text="No collections scheduled yet." />
      )}
    </Panel>
  );
}

function Dashboard() {
  const { role, profile, companyId } = useProfile();
  const isAdmin = role === "admin";
  const { data } = useDashboardData(companyId, !isAdmin);

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const activeCompanies = (data?.companies ?? []).filter((c) => c.status === "active").length;

  return (
    <div>
      <div className="green-gradient mb-8 rounded-2xl p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-wider opacity-80">
          {roleLabels[role]} workspace
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">Hello {firstName}</h1>
        <p className="mt-1 max-w-xl text-sm opacity-90">
          {isAdmin
            ? "Oversee every waste collection company, their staff and the money moving through the system."
            : role === "company_admin"
              ? "Run your company: staff, customers, routes and payments in one place."
              : role === "driver"
                ? "Your routes and collections for today."
                : "Your daily work: customers, collections and payments."}
        </p>
      </div>

      {isAdmin ? (
        <AdminView data={data} activeCompanies={activeCompanies} />
      ) : role === "company_admin" ? (
        <CompanyView data={data} />
      ) : (
        <EmployeeView data={data} role={role} />
      )}
    </div>
  );
}

type Data = ReturnType<typeof useDashboardData>["data"];

function AdminView({ data, activeCompanies }: { data: Data; activeCompanies: number }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Companies"
          value={data?.companies.length ?? 0}
          icon={Building2}
          hint={`${activeCompanies} active`}
        />
        <StatCard
          label="Staff accounts"
          value={data?.staff.length ?? 0}
          icon={UserCog}
          hint="Managers, employees and drivers"
        />
        <StatCard label="Customers" value={data?.customers ?? 0} icon={Users} />
        <StatCard
          label="Revenue collected"
          value={money(data?.revenue)}
          icon={Wallet}
          hint={`${data?.paidCount ?? 0} paid transactions`}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="This month" value={money(data?.monthRevenue)} icon={Receipt} />
        <StatCard
          label="Not yet paid"
          value={money(data?.outstanding)}
          icon={AlertTriangle}
          hint={`${data?.pendingCount ?? 0} pending`}
        />
        <StatCard label="Vehicles in the system" value={data?.vehicles.length ?? 0} icon={Truck} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Companies" to="/companies">
          {data?.companies.length ? (
            <ul className="space-y-3 text-sm">
              {data.companies.slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    {c.name}
                  </span>
                  <Badge variant={c.status === "active" ? "default" : "outline"}>{c.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <Empty text="No company registered yet." />
              <Button asChild size="sm" className="mt-4">
                <Link to="/companies">Register the first company</Link>
              </Button>
            </div>
          )}
        </Panel>
        <RoutesPanel routes={data?.routes ?? []} />
      </div>
    </>
  );
}

function CompanyView({ data }: { data: Data }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Customers" value={data?.customers ?? 0} icon={Users} />
        <StatCard
          label="Active subscriptions"
          value={data?.activeSubs ?? 0}
          icon={CalendarClock}
        />
        <StatCard
          label="Revenue collected"
          value={money(data?.revenue)}
          icon={Wallet}
          hint={`${money(data?.monthRevenue)} this month`}
        />
        <StatCard
          label="Not yet paid"
          value={money(data?.outstanding)}
          icon={AlertTriangle}
          hint={`${data?.pendingCount ?? 0} pending`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="My team" to="/staff">
          {data?.staff.length ? (
            <ul className="space-y-3 text-sm">
              {data.staff.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <UserCog className="size-4 text-primary" />
                    {s.full_name || "Unnamed"}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.position ?? "staff"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <Empty text="No employee account created yet." />
              <Button asChild size="sm" className="mt-4">
                <Link to="/staff">Create an employee account</Link>
              </Button>
            </div>
          )}
        </Panel>
        <SchedulesPanel schedules={data?.schedules ?? []} />
        <RoutesPanel routes={data?.routes ?? []} />
        <Panel title="Vehicles" to="/operations">
          {data?.vehicles.length ? (
            <ul className="space-y-3 text-sm">
              {data.vehicles.slice(0, 6).map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <Truck className="size-4 text-primary" />
                    {v.plate_number}
                  </span>
                  <Badge variant="outline">{v.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No vehicle registered yet." />
          )}
        </Panel>
      </div>
    </>
  );
}

function EmployeeView({ data, role }: { data: Data; role: string }) {
  const isDriver = role === "driver";
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={isDriver ? "My routes" : "Routes today"}
          value={data?.routes.length ?? 0}
          icon={RouteIcon}
        />
        <StatCard label="Collections done" value={data?.doneToday ?? 0} icon={CheckCircle2} />
        <StatCard label="Customers served" value={data?.customers ?? 0} icon={Users} />
        <StatCard
          label="Payments recorded"
          value={money(data?.revenue)}
          icon={Wallet}
          hint={`${data?.paidCount ?? 0} transactions`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RoutesPanel routes={data?.routes ?? []} />
        <SchedulesPanel schedules={data?.schedules ?? []} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/operations">Open my work</Link>
        </Button>
        {!isDriver ? (
          <Button asChild variant="outline">
            <Link to="/payments">Record a payment</Link>
          </Button>
        ) : null}
      </div>
    </>
  );
}
