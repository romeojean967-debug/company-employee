import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageTitle } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Percent, MapPin } from "lucide-react";
import { fetchPayments, fetchSubscriptions, money } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports & analysis — Isuku Route System" },
      { name: "description", content: "Revenue trends, profit analysis and payment behaviour per location." },
      { property: "og:title", content: "Reports & analysis — Isuku Route System" },
      { property: "og:description", content: "Revenue trends and payment behaviour per location." },
    ],
  }),
  component: Reports,
});

const GREEN = "oklch(0.72 0.18 152)";
const GREEN_SOFT = "oklch(0.55 0.13 152)";
const GREY = "oklch(0.45 0 0)";

function Reports() {
  const { data: payments } = useQuery({ queryKey: ["payments"], queryFn: fetchPayments });
  const { data: subs } = useQuery({ queryKey: ["subscriptions"], queryFn: fetchSubscriptions });

  const analysis = useMemo(() => {
    const all = payments ?? [];
    const paid = all.filter((p) => p.status === "paid");
    const collected = paid.reduce((s, p) => s + Number(p.amount ?? 0), 0);
    const outstanding = all
      .filter((p) => p.status !== "paid")
      .reduce((s, p) => s + Number(p.amount ?? 0), 0);
    const expected = (subs ?? [])
      .filter((s) => s.status === "active")
      .reduce((s, x) => s + Number(x.amount ?? 0), 0);

    const byMonth = new Map<string, { month: string; collected: number; pending: number }>();
    for (const p of all) {
      const month = (p.payment_date ?? "").slice(0, 7) || "unknown";
      const row = byMonth.get(month) ?? { month, collected: 0, pending: 0 };
      if (p.status === "paid") row.collected += Number(p.amount ?? 0);
      else row.pending += Number(p.amount ?? 0);
      byMonth.set(month, row);
    }

    const byLocation = new Map<
      string,
      { district: string; collected: number; outstanding: number; count: number }
    >();
    for (const p of all) {
      const district = p.customers?.locations?.district ?? "Unassigned";
      const row = byLocation.get(district) ?? {
        district,
        collected: 0,
        outstanding: 0,
        count: 0,
      };
      row.count += 1;
      if (p.status === "paid") row.collected += Number(p.amount ?? 0);
      else row.outstanding += Number(p.amount ?? 0);
      byLocation.set(district, row);
    }

    const locations = [...byLocation.values()]
      .map((l) => ({
        ...l,
        rate: l.collected + l.outstanding > 0
          ? Math.round((l.collected / (l.collected + l.outstanding)) * 100)
          : 0,
      }))
      .sort((a, b) => b.collected - a.collected);

    return {
      collected,
      outstanding,
      expected,
      rate: collected + outstanding > 0
        ? Math.round((collected / (collected + outstanding)) * 100)
        : 0,
      months: [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)),
      locations,
    };
  }, [payments, subs]);

  const pieData = [
    { name: "Collected", value: analysis.collected },
    { name: "Not paid", value: analysis.outstanding },
  ];

  return (
    <div>
      <PageTitle
        title="Reports & analysis"
        subtitle="How much the business earns, where it earns it and who pays well"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Collected" value={money(analysis.collected)} icon={TrendingUp} />
        <StatCard label="Not paid" value={money(analysis.outstanding)} icon={TrendingUp} />
        <StatCard
          label="Collection rate"
          value={`${analysis.rate}%`}
          icon={Percent}
          hint="share of billed money actually received"
        />
        <StatCard
          label="Expected monthly"
          value={money(analysis.expected)}
          icon={MapPin}
          hint="from active subscriptions"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Revenue trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysis.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="month" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0 0)",
                    border: "1px solid oklch(1 0 0 / 12%)",
                    borderRadius: 12,
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="collected" stroke={GREEN} strokeWidth={2} />
                <Line type="monotone" dataKey="pending" stroke={GREY} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="mb-4 font-semibold">Paid vs not paid</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={i === 0 ? GREEN : GREY} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0 0)",
                    border: "1px solid oklch(1 0 0 / 12%)",
                    borderRadius: 12,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 surface-card p-6">
        <h2 className="mb-4 font-semibold">Revenue by location</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysis.locations}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
              <XAxis dataKey="district" stroke="currentColor" fontSize={12} />
              <YAxis stroke="currentColor" fontSize={12} />
              <Tooltip
                cursor={{ fill: "oklch(1 0 0 / 5%)" }}
                contentStyle={{
                  background: "oklch(0.18 0 0)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  borderRadius: 12,
                }}
              />
              <Legend />
              <Bar dataKey="collected" fill={GREEN} radius={[6, 6, 0, 0]} />
              <Bar dataKey="outstanding" fill={GREEN_SOFT} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Collected</TableHead>
              <TableHead>Not paid</TableHead>
              <TableHead>Payment behaviour</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analysis.locations.map((l) => (
              <TableRow key={l.district}>
                <TableCell className="font-medium">{l.district}</TableCell>
                <TableCell>{l.count}</TableCell>
                <TableCell>{money(l.collected)}</TableCell>
                <TableCell>{money(l.outstanding)}</TableCell>
                <TableCell>
                  <Badge variant={l.rate >= 70 ? "default" : "outline"}>
                    {l.rate}% {l.rate >= 70 ? "· pays well" : "· needs follow-up"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {!analysis.locations.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No payment data yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
