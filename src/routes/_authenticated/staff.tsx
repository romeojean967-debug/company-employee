import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
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
import { fetchCompanies, fetchStaff } from "@/lib/queries";
import { formGetter } from "@/lib/form";
import { createUserAccount } from "@/lib/admin.functions";
import { useProfile } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/staff")({
  head: () => ({
    meta: [
      { title: "Staff & drivers — Isuku Route System" },
      { name: "description", content: "Create and manage office employees, field staff and drivers." },
      { property: "og:title", content: "Staff & drivers — Isuku Route System" },
      { property: "og:description", content: "Manage office employees, field staff and drivers." },
    ],
  }),
  component: Staff,
});

function Staff() {
  const qc = useQueryClient();
  const { role } = useProfile();
  const [open, setOpen] = useState(false);

  const { data: staff } = useQuery({ queryKey: ["staff"], queryFn: fetchStaff });
  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    enabled: role === "admin",
  });

  const addStaff = useMutation({
    mutationFn: async (get: (k: string) => string) =>
      createUserAccount({
        data: {
          email: get("email"),
          password: get("password"),
          full_name: get("full_name"),
          phone: get("phone"),
          position: get("position"),
          license_number: get("license_number"),
          role: get("role") as "employee" | "driver" | "company_admin",
          company_id: role === "admin" ? get("company_id") || null : null,
        },
      }),
    onSuccess: () => {
      toast.success("Account created. Share the temporary password with them.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageTitle
        title="Staff & drivers"
        subtitle="Office employees, field employees and drivers of your company"
      />

      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add employee</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create an employee account</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                addStaff.mutate(formGetter(e.currentTarget));
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="s-name">Full name</Label>
                <Input id="s-name" name="full_name" required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="s-phone">Phone</Label>
                  <Input id="s-phone" name="phone" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-role">Role</Label>
                  <select
                    id="s-role"
                    name="role"
                    defaultValue="employee"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="employee">Employee (office / field)</option>
                    <option value="driver">Driver</option>
                    <option value="company_admin">Company manager</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="s-position">Position</Label>
                  <Input id="s-position" name="position" placeholder="e.g. Field supervisor" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-license">Driving licence (drivers)</Label>
                  <Input id="s-license" name="license_number" />
                </div>
              </div>
              {role === "admin" && (
                <div className="space-y-1.5">
                  <Label htmlFor="s-company">Company</Label>
                  <select
                    id="s-company"
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
              <div className="space-y-1.5">
                <Label htmlFor="s-email">Email</Label>
                <Input id="s-email" name="email" type="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-pass">Temporary password</Label>
                <Input id="s-pass" name="password" minLength={6} required />
              </div>
              <Button type="submit" className="w-full" disabled={addStaff.isPending}>
                Create account
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
              <TableHead>Position</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(staff ?? []).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.full_name || "—"}</TableCell>
                <TableCell>{s.position ?? (s.license_number ? "Driver" : "—")}</TableCell>
                <TableCell>{s.phone ?? "—"}</TableCell>
                <TableCell>{s.companies?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{s.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {!staff?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No employees yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
