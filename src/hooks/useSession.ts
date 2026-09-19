import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "company_admin" | "employee" | "driver" | "customer";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useProfile() {
  const { user, loading } = useSession();

  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user!.id),
      ]);
      const roleList = (roles ?? []).map((r) => r.role as AppRole);
      return {
        profile,
        roles: roleList,
        role: (roleList[0] ?? "customer") as AppRole,
      };
    },
  });

  return {
    user,
    loading: loading || query.isLoading,
    profile: query.data?.profile ?? null,
    roles: query.data?.roles ?? [],
    role: query.data?.role ?? ("customer" as AppRole),
    companyId: query.data?.profile?.company_id ?? null,
  };
}

export const roleLabels: Record<AppRole, string> = {
  admin: "System Administrator",
  company_admin: "Company Manager",
  employee: "Office / Field Employee",
  driver: "Driver",
  customer: "Customer",
};
