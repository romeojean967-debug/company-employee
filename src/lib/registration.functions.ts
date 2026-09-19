import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const strongPassword = z
  .string()
  .min(8)
  .refine(
    (pw) =>
      /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw),
    "Password is not strong enough",
  );

const applicationSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: strongPassword,
  company_name: z.string().min(2),
  province: z.string().min(1),
  district: z.string().min(1),
  sector: z.string().min(1),
  cell: z.string().optional().default(""),
  street: z.string().optional().default(""),
  building: z.string().optional().default(""),
  description: z.string().optional().default(""),
  phone: z.string().min(6),
  office_phone: z.string().optional().default(""),
  rdb_registered: z.boolean(),
  rdb_certificate_number: z.string().optional().default(""),
  document_name: z.string().optional().default(""),
  document_base64: z.string().optional().default(""),
  document_kind: z.string().optional().default(""),
  terms_accepted: z.literal(true),
});

export const submitCompanyApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => applicationSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("company_applications")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    if (existing) throw new Error("An application with this email already exists");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        phone: data.phone,
        role: "company_admin",
      },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the account");
    const userId = created.user.id;

    let documentPath: string | null = null;
    if (data.document_base64 && data.document_name) {
      const bytes = Uint8Array.from(atob(data.document_base64), (c) => c.charCodeAt(0));
      const safeName = data.document_name.replace(/[^A-Za-z0-9._-]/g, "_");
      const path = `${userId}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("company-documents")
        .upload(path, bytes, { contentType: "application/octet-stream", upsert: true });
      if (!upErr) documentPath = path;
    }

    await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        terms_accepted_at: new Date().toISOString(),
      });

    const { error: appErr } = await supabaseAdmin.from("company_applications").insert({
      user_id: userId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      company_name: data.company_name,
      province: data.province,
      district: data.district,
      sector: data.sector,
      cell: data.cell,
      street: data.street,
      building: data.building,
      description: data.description,
      office_phone: data.office_phone,
      rdb_registered: data.rdb_registered,
      rdb_certificate_number: data.rdb_certificate_number,
      document_path: documentPath,
      document_kind: data.document_kind,
      terms_accepted_at: new Date().toISOString(),
      status: "pending",
    });
    if (appErr) throw new Error(appErr.message);

    return { ok: true };
  });

const reviewSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  note: z.string().optional().default(""),
});

export const reviewCompanyApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => reviewSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw new Error("Administrators only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: app, error } = await supabaseAdmin
      .from("company_applications")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !app) throw new Error("Application not found");

    let companyId: string | null = app.company_id;

    if (data.decision === "approved") {
      const address = [app.street, app.building, app.cell, app.sector, app.district, app.province]
        .filter(Boolean)
        .join(", ");
      const { data: company, error: cErr } = await supabaseAdmin
        .from("companies")
        .insert({
          name: app.company_name,
          registration_number: app.rdb_certificate_number || null,
          address,
          phone: app.office_phone || app.phone,
          email: app.email,
          status: "active",
        })
        .select("id")
        .single();
      if (cErr || !company) throw new Error(cErr?.message ?? "Could not create the company");
      companyId = company.id;

      if (app.user_id) {
        await supabaseAdmin.from("profiles").update({ company_id: companyId }).eq("id", app.user_id);
        await supabaseAdmin.from("user_roles").delete().eq("user_id", app.user_id);
        await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: app.user_id, role: "company_admin" });
      }
    }

    await supabaseAdmin
      .from("company_applications")
      .update({
        status: data.decision,
        review_note: data.note,
        reviewed_at: new Date().toISOString(),
        company_id: companyId,
      })
      .eq("id", data.id);

    return { ok: true };
  });

export const getApplicationDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ path: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw new Error("Administrators only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("company-documents")
      .createSignedUrl(data.path, 300);
    if (error || !signed) throw new Error("Could not open the document");
    return { url: signed.signedUrl };
  });

export const acceptTerms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase
      .from("profiles")
      .update({ terms_accepted_at: new Date().toISOString() })
      .eq("id", context.userId);
    return { ok: true };
  });
