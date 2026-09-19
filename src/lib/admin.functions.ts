import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  phone: z.string().optional(),
  position: z.string().optional(),
  license_number: z.string().optional(),
  company_id: z.string().uuid().nullable().optional(),
  role: z.enum(["admin", "company_admin", "employee", "driver", "customer"]),
});

export const createUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createUserSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Who is calling?
    const [{ data: roles }, { data: me }] = await Promise.all([
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase.from("profiles").select("company_id").eq("id", context.userId).maybeSingle(),
    ]);
    const callerRoles = (roles ?? []).map((r) => r.role as string);
    const isAdmin = callerRoles.includes("admin");
    const isCompanyAdmin = callerRoles.includes("company_admin");
    if (!isAdmin && !isCompanyAdmin) throw new Error("Not allowed to create accounts");

    let companyId = data.company_id ?? null;
    if (!isAdmin) {
      companyId = me?.company_id ?? null;
      if (!companyId) throw new Error("Your account is not linked to a company yet");
      if (data.role === "admin") throw new Error("Only a system administrator can do that");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, phone: data.phone ?? "", role: data.role },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the account");

    const userId = created.user.id;

    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? null,
      company_id: companyId,
      position: data.position ?? null,
      license_number: data.license_number ?? null,
    });

    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: data.role });

    if (data.role === "customer" && companyId) {
      await supabaseAdmin.from("customers").insert({
        user_id: userId,
        company_id: companyId,
        name: data.full_name,
        email: data.email,
        phone: data.phone ?? null,
      });
    }

    return { ok: true, userId };
  });
