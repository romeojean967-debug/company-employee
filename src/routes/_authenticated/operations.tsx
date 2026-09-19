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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { fetchRoutes, fetchSchedules, fetchSubscriptions, fetchVehicles } from "@/lib/queries";
import { formGetter } from "@/lib/form";
import { useProfile } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/operations")({
  head: () => ({
    meta: [
      { title: "Collections & routes — Isuku Route System" },
      { name: "description", content: "Plan collection schedules, routes and vehicles." },
      { property: "og:title", content: "Collections & routes — Isuku Route System" },
      { property: "og:description", content: "Plan collection schedules, routes and vehicles." },
    ],
  }),
  component: Operations,
});

function Operations() {
  const qc = useQueryClient();
  const { companyId, role } = useProfile();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  function requireCompany() {
    if (!companyId) throw new Error("Your account is not linked to a company yet.");
    return companyId;
  }

  const { data: schedules } = useQuery({ queryKey: ["schedules"], queryFn: fetchSchedules });
  const { data: routes } = useQuery({ queryKey: ["routes"], queryFn: fetchRoutes });
  const { data: vehicles } = useQuery({ queryKey: ["vehicles"], queryFn: fetchVehicles });
  const { data: subscriptions } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: fetchSubscriptions,
  });

  const addSchedule = useMutation({
    mutationFn: async (get: (k: string) => string) => {
      const { error } = await supabase.from("collection_schedules").insert({
        subscription_id: get("subscription_id") || null,
        collection_date: get("collection_date"),
        time_slot: get("time_slot"),
        notes: get("notes"),
        company_id: requireCompany(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Collection scheduled");
      setScheduleOpen(false);
      qc.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addRoute = useMutation({
    mutationFn: async (get: (k: string) => string) => {
      const { error } = await supabase.from("routes").insert({
        route_name: get("route_name"),
        vehicle_id: get("vehicle_id") || null,
        start_time: get("start_time") || null,
        company_id: requireCompany(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Route created");
      setRouteOpen(false);
      qc.invalidateQueries({ queryKey: ["routes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addVehicle = useMutation({
    mutationFn: async (get: (k: string) => string) => {
      const { error } = await supabase.from("vehicles").insert({
        plate_number: get("plate_number"),
        type: get("vehicle_type"),
        capacity: get("capacity_kg") || null,
        company_id: requireCompany(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vehicle added");
      setVehicleOpen(false);
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("collection_schedules").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const canEdit = role === "admin" || role === "company_admin" || role === "employee";

  return (
    <div>
      <PageTitle
        title="Collections & routes"
        subtitle="Daily pick-ups, the routes drivers follow and the trucks they use"
      />

      <Tabs defaultValue="schedules">
        <TabsList>
          <TabsTrigger value="schedules">Collections</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="mt-4">
          {canEdit && (
            <div className="mb-4 flex justify-end">
              <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogTrigger asChild>
                  <Button>Schedule collection</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule a collection</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addSchedule.mutate(formGetter(e.currentTarget));
                    }}
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="sc-sub">Customer subscription</Label>
                      <select
                        id="sc-sub"
                        name="subscription_id"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select subscription</option>
                        {(subscriptions ?? []).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.customers?.name ?? "Customer"} · {s.plan_type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="sc-date">Date</Label>
                        <Input id="sc-date" name="collection_date" type="date" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sc-slot">Time slot</Label>
                        <Input id="sc-slot" name="time_slot" placeholder="Morning" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sc-notes">Notes</Label>
                      <Input id="sc-notes" name="notes" />
                    </div>
                    <Button type="submit" className="w-full" disabled={addSchedule.isPending}>
                      Save collection
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Time slot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(schedules ?? []).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.collection_date}</TableCell>
                    <TableCell>{s.subscriptions?.customers?.name ?? "—"}</TableCell>
                    <TableCell>{s.time_slot ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {s.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStatus.mutate({ id: s.id, status: "completed" })}
                        >
                          Mark collected
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!schedules?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No collections scheduled yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="mt-4">
          {canEdit && (
            <div className="mb-4 flex justify-end">
              <Dialog open={routeOpen} onOpenChange={setRouteOpen}>
                <DialogTrigger asChild>
                  <Button>Create route</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a route</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addRoute.mutate(formGetter(e.currentTarget));
                    }}
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="r-name">Route name</Label>
                      <Input id="r-name" name="route_name" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="r-vehicle">Vehicle</Label>
                      <select
                        id="r-vehicle"
                        name="vehicle_id"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select vehicle</option>
                        {(vehicles ?? []).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.plate_number}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="r-start">Start time</Label>
                      <Input id="r-start" name="start_time" type="datetime-local" />
                    </div>
                    <Button type="submit" className="w-full" disabled={addRoute.isPending}>
                      Save route
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(routes ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.route_name}</TableCell>
                    <TableCell>{r.vehicles?.plate_number ?? "—"}</TableCell>
                    <TableCell>
                      {r.start_time ? new Date(r.start_time).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!routes?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No routes yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="mt-4">
          {canEdit && (
            <div className="mb-4 flex justify-end">
              <Dialog open={vehicleOpen} onOpenChange={setVehicleOpen}>
                <DialogTrigger asChild>
                  <Button>Add vehicle</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a vehicle</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addVehicle.mutate(formGetter(e.currentTarget));
                    }}
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="v-plate">Plate number</Label>
                      <Input id="v-plate" name="plate_number" required />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="v-type">Type</Label>
                        <Input id="v-type" name="vehicle_type" placeholder="Truck" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="v-cap">Capacity (kg)</Label>
                        <Input id="v-cap" name="capacity_kg" type="number" min="0" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={addVehicle.isPending}>
                      Save vehicle
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(vehicles ?? []).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.plate_number}</TableCell>
                    <TableCell>{v.type ?? "—"}</TableCell>
                    <TableCell>{v.capacity ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{v.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!vehicles?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No vehicles yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
