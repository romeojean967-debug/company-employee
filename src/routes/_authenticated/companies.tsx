import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createUserAccount } from "@/lib/admin.functions";
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
import { fetchCompanies } from "@/lib/queries";
import { formGetter } from "@/lib/form";

export const Route = createFileRoute("/_authenticated/companies")({
  head: () => ({
    meta: [
      { title: "Companies — Isuku Route System" },
      { name: "description", content: "Register and oversee every waste collection company." },
      { property: "og:title", content: "Companies — Isuku Route System" },
      { property: "og:description", content: "Register and oversee waste collection companies." },
    ],
  }),
  component: Companies,
});

function Companies() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [managerFor, setManagerFor] = useState<{ id: string; name: string } | null>(null);

  const { data: companies } = useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });

  const addCompany = useMutation({
    mutationFn: async (get: (k: string) => string) => {
      const { error } = await supabase.from("companies").insert({
        name: get("name"),
        registration_number: get("registration_number"),
        address: get("address"),
        phone: get("phone"),
        email: get("email"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Company registered");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addManager = useMutation({
    mutationFn: async (get: (k: string) => string) =>
      createUserAccount({
        data: {
          email: get("email"),
          password: get("password"),
          full_name: get("full_name"),
          phone: get("phone"),
          role: "company_admin",
          company_id: managerFor!.id,
        },
      }),
    onSuccess: () => {
      toast.success("Company manager account created");
      setManagerFor(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageTitle
        title="Companies"
        subtitle="Every waste collection company operating on the platform"
      />

      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Register company</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register a company</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                addCompany.mutate(formGetter(e.currentTarget));
              }}
            >
              {[
                ["name", "Company name", true],
                ["registration_number", "Registration number", false],
                ["phone", "Phone", false],
                ["email", "Email", false],
                ["address", "Address", false],
              ].map(([n, l, req]) => (
                <div key={n as string} className="space-y-1.5">
                  <Label htmlFor={n as string}>{l as string}</Label>
                  <Input id={n as string} name={n as string} required={Boolean(req)} />
                </div>
              ))}
              <Button type="submit" className="w-full" disabled={addCompany.isPending}>
                Save company
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
              <TableHead>Registration</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(companies ?? []).map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.registration_number ?? "—"}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{c.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setManagerFor({ id: c.id, name: c.name })}
                  >
                    Add manager
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!companies?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No companies registered yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!managerFor} onOpenChange={(o) => !o && setManagerFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manager for {managerFor?.name}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              addManager.mutate(formGetter(e.currentTarget));
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="m-name">Full name</Label>
              <Input id="m-name" name="full_name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-phone">Phone</Label>
              <Input id="m-phone" name="phone" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-email">Email</Label>
              <Input id="m-email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-pass">Temporary password</Label>
              <Input id="m-pass" name="password" minLength={6} required />
            </div>
            <Button type="submit" className="w-full" disabled={addManager.isPending}>
              Create manager account
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
