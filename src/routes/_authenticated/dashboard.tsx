import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, Wallet, Truck, AlertTriangle, CalendarClock } from "lucide-react";
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
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { role, profile } = useProfile();

  const { data } = useQuery({
    queryKey: ["dashboard", role],
    queryFn: async () => {
      const [companies, customers, payments, routes, schedules, subs] = await Promise.all([
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount, status, payment_date"),
        supabase.from("routes").select("id, route_name, status, start_time").limit(5),
        supabase
          .from("collection_schedules")
          .select("id, collection_date, time_slot, status")
          .order("collection_date", { ascending: false })
          .limit(5),
        supabase.from("subscriptions").select("id, amount, status"),
      ]);

      const paid = (payments.data ?? []).filter((p) => p.status === "paid");
      const pending = (payments.data ?? []).filter((p) => p.status !== "paid");
      const revenue = paid.reduce((s, p) => s + Number(p.amount ?? 0), 0);
      const outstanding = pending.reduce((s, p) => s + Number(p.amount ?? 0), 0);

      return {
        companies: companies.count ?? 0,
        customers: customers.count ?? 0,
        revenue,
        outstanding,
        paidCount: paid.length,
        pendingCount: pending.length,
        routes: routes.data ?? [],
        schedules: schedules.data ?? [],
        activeSubs: (subs.data ?? []).filter((s) => s.status === "active").length,
      };
    },
  });

  return (
    <div>
      <PageTitle
        title={`Hello ${profile?.full_name?.split(" ")[0] || "there"}`}
        subtitle={`${roleLabels[role]} · everything happening in your area of the system`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {role === "admin" ? (
          <StatCard label="Companies" value={data?.companies ?? 0} icon={Building2} />
        ) : (
          <StatCard label="Active subscriptions" value={data?.activeSubs ?? 0} icon={CalendarClock} />
        )}
        <StatCard label="Customers" value={data?.customers ?? 0} icon={Users} />
        <StatCard
          label="Revenue collected"
          value={money(data?.revenue)}
          icon={Wallet}
          hint={`${data?.paidCount ?? 0} paid transactions`}
        />
        <StatCard
          label="Not yet paid"
          value={money(data?.outstanding)}
          icon={AlertTriangle}
          hint={`${data?.pendingCount ?? 0} pending transactions`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Latest routes</h2>
            <Button asChild size="sm" variant="ghost">
              <Link to="/operations">View all</Link>
            </Button>
          </div>
          {data?.routes.length ? (
            <ul className="space-y-3 text-sm">
              {data.routes.map((r) => (
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
            <p className="text-sm text-muted-foreground">No routes recorded yet.</p>
          )}
        </div>

        <div className="surface-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent collections</h2>
            <Button asChild size="sm" variant="ghost">
              <Link to="/operations">View all</Link>
            </Button>
          </div>
          {data?.schedules.length ? (
            <ul className="space-y-3 text-sm">
              {data.schedules.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {s.collection_date} · {s.time_slot ?? "any time"}
                  </span>
                  <Badge variant="outline">{s.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No collections scheduled yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
