import { supabase } from "@/integrations/supabase/client";

export function money(value: number | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} RWF`;
}

export async function fetchCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*, locations(district, sector, cell, village), companies(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("*, customers(name, location_id, locations(district, sector))")
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchSubscriptions() {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, customers(name)")
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchSchedules() {
  const { data, error } = await supabase
    .from("collection_schedules")
    .select("*, subscriptions(customers(name))")
    .order("collection_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchRoutes() {
  const { data, error } = await supabase
    .from("routes")
    .select("*, vehicles(plate_number)")
    .order("start_time", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function fetchVehicles() {
  const { data, error } = await supabase.from("vehicles").select("*").order("plate_number");
  if (error) throw error;
  return data;
}

export async function fetchStaff() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, companies(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchLocations() {
  const { data, error } = await supabase.from("locations").select("*").order("district");
  if (error) throw error;
  return data;
}
