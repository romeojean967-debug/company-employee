import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, AlertTriangle, Receipt } from "lucide-react";
import { fetchCustomers, fetchPayments, money } from "@/lib/queries";
import { formGetter } from "@/lib/form";
import { useProfile } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Isuku Route System" },
      { name: "description", content: "Record payments, track what is paid and what is still owed." },
      { property: "og:title", content: "Payments — Isuku Route System" },
      { property: "og:description", content: "Record payments and track what is still owed." },
    ],
  }),
  component: Payments,
});

function Payments() {
  const qc = useQueryClient();
  const { role, companyId } = useProfile();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  const { data: payments } = useQuery({ queryKey: ["payments"], queryFn: fetchPayments });
  const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });

  function requireCompany() {
    if (!companyId) throw new Error("Your account is not linked to a company yet.");
    return companyId;
  }

  const staff = role === "admin" || role === "company_admin" || role === "employee";

  const recordPayment = useMutation({
    mutationFn: async (get: (k: string) => string) => {
      const status = get("status") || "paid";
      const { data, error } = await supabase
        .from("payments")
        .insert({
          customer_id: get("customer_id"),
          amount: Number(get("amount")),
          payment_method: get("method"),
          transaction_reference: get("reference"),
          payment_date: get("payment_date") || new Date().toISOString().slice(0, 10),
          status,
          company_id: requireCompany(),
        })
        .select("id, amount")
        .single();
      if (error) throw error;
      if (status === "paid") {
        await supabase.from("digital_receipts").insert({
          payment_id: data.id,
          company_id: requireCompany(),
          barcode: `ISK-${Date.now().toString().slice(-8)}`,
        });
      }
    },
    onSuccess: () => {
      toast.success("Transaction recorded");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payments").update({ status: "paid" }).eq("id", id);
      if (error) throw error;
      await supabase.from("digital_receipts").insert({
        payment_id: id,
        company_id: requireCompany(),
        barcode: `ISK-${Date.now().toString().slice(-8)}`,
      });
    },
    onSuccess: () => {
      toast.success("Marked as paid");
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const all = payments ?? [];
  const paid = all.filter((p) => p.status === "paid");
  const pending = all.filter((p) => p.status !== "paid");
  const rows = filter === "paid" ? paid : filter === "pending" ? pending : all;

  return (
    <div>
      <PageTitle
        title="Payments"
        subtitle="Every transaction recorded — paid, pending and overdue"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Collected"
          value={money(paid.reduce((s, p) => s + Number(p.amount ?? 0), 0))}
          icon={Wallet}
          hint={`${paid.length} paid`}
        />
        <StatCard
          label="Outstanding"
          value={money(pending.reduce((s, p) => s + Number(p.amount ?? 0), 0))}
          icon={AlertTriangle}
          hint={`${pending.length} not paid`}
        />
        <StatCard label="Transactions" value={all.length} icon={Receipt} />
      </div>

      <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "paid", "pending"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "pending" ? "Not paid" : f}
            </Button>
          ))}
        </div>
        {staff && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Record transaction</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record a transaction</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  recordPayment.mutate(formGetter(e.currentTarget));
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="p-customer">Customer</Label>
                  <select
                    id="p-customer"
                    name="customer_id"
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select customer</option>
                    {(customers ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-amount">Amount (RWF)</Label>
                    <Input id="p-amount" name="amount" type="number" min="0" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-date">Date</Label>
                    <Input id="p-date" name="payment_date" type="date" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-method">Method</Label>
                    <select
                      id="p-method"
                      name="method"
                      defaultValue="mobile_money"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="mobile_money">Mobile money</option>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank transfer</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-status">Status</Label>
                    <select
                      id="p-status"
                      name="status"
                      defaultValue="paid"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Not paid</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-ref">Reference</Label>
                  <Input id="p-ref" name="reference" placeholder="MoMo code, receipt no." />
                </div>
                <Button type="submit" className="w-full" disabled={recordPayment.isPending}>
                  Save transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.payment_date ?? "—"}</TableCell>
                <TableCell className="font-medium">{p.customers?.name ?? "—"}</TableCell>
                <TableCell>{p.customers?.locations?.district ?? "—"}</TableCell>
                <TableCell className="capitalize">
                  {(p.payment_method ?? "—").toString().replace("_", " ")}
                </TableCell>
                <TableCell>{money(p.amount)}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "paid" ? "default" : "outline"}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {staff && p.status !== "paid" && (
                    <Button size="sm" variant="ghost" onClick={() => markPaid.mutate(p.id)}>
                      Mark paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No transactions to show.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
