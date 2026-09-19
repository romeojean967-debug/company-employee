import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/AppShell";
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
import { fetchCompanies, fetchCustomers, fetchLocations } from "@/lib/queries";
import { formGetter } from "@/lib/form";
import { useProfile } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Isuku Route System" },
      { name: "description", content: "Register households and businesses and follow their status." },
      { property: "og:title", content: "Customers — Isuku Route System" },
      { property: "og:description", content: "Register households and businesses and follow them." },
    ],
  }),
  component: Customers,
});

function Customers() {
  const qc = useQueryClient();
  const { role, companyId } = useProfile();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });
  const { data: locations } = useQuery({ queryKey: ["locations"], queryFn: fetchLocations });
  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    enabled: role === "admin",
  });

  const addCustomer = useMutation({
    mutationFn: async (get: (k: string) => string) => {
      let locationId: string | null = null;
      if (get("district")) {
        const { data: loc, error: locError } = await supabase
          .from("locations")
          .insert({
            district: get("district"),
            sector: get("sector"),
            cell: get("cell"),
            village: get("village"),
          })
          .select("id")
          .single();
        if (locError) throw locError;
        locationId = loc.id;
      }
      const targetCompany = role === "admin" ? get("company_id") || null : companyId;
      const { error } = await supabase.from("customers").insert({
        name: get("name"),
        phone: get("phone"),
        email: get("email"),
        address: get("address"),
        company_id: targetCompany,
        location_id: locationId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Customer registered");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (customers ?? []).filter((c) =>
    `${c.name} ${c.phone ?? ""} ${c.locations?.district ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageTitle title="Customers" subtitle="Households and businesses served by your company" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search by name, phone or district"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Register customer</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register a customer</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                addCustomer.mutate(formGetter(e.currentTarget));
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Full name / business name</Label>
                <Input id="c-name" name="name" required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="c-phone">Phone</Label>
                  <Input id="c-phone" name="phone" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-email">Email</Label>
                  <Input id="c-email" name="email" type="email" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-address">Address</Label>
                <Input id="c-address" name="address" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["district", "District"],
                  ["sector", "Sector"],
                  ["cell", "Cell"],
                  ["village", "Village"],
                ].map(([n, l]) => (
                  <div key={n} className="space-y-1.5">
                    <Label htmlFor={`c-${n}`}>{l}</Label>
                    <Input id={`c-${n}`} name={n} />
                  </div>
                ))}
              </div>
              {role === "admin" && (
                <div className="space-y-1.5">
                  <Label htmlFor="c-company">Company</Label>
                  <select
                    id="c-company"
                    name="company_id"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select company</option>
                    {(companies ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={addCustomer.isPending}>
                Save customer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>
                  {c.locations
                    ? [c.locations.district, c.locations.sector, c.locations.cell]
                        .filter(Boolean)
                        .join(" · ")
                    : (c.address ?? "—")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{c.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No customers yet. {locations?.length ? "" : ""}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
