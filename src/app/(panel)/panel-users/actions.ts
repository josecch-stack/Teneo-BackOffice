"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/dal";
import type { PanelRole } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit/log";
import { panelUserFormSchema } from "@/lib/validations/panel-user";

export interface PanelUserRow {
  user_id: string;
  email: string;
  full_name: string;
  role: PanelRole;
  active: boolean;
  created_at: string;
}

export async function listPanelUsers(): Promise<PanelUserRow[]> {
  await requirePermission("role:manage");
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: rows, error } = await supabase
    .from("panel_users")
    .select("user_id, role, full_name, active, created_at")
    .order("created_at", { ascending: false });

  if (error || !rows) {
    console.error("listPanelUsers failed", error);
    return [];
  }

  // panel_users doesn't store email (it lives in auth.users) — the Admin API
  // is the only way to read it, and it's already required below for creating
  // accounts.
  const { data: authData } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  const emailByUserId = new Map(
    authData?.users.map((u) => [u.id, u.email ?? ""]),
  );

  return rows.map((r) => ({
    ...r,
    email: emailByUserId.get(r.user_id) ?? "—",
  }));
}

export interface PanelUserFormState {
  error?: string;
  success?: boolean;
}

export async function createPanelUser(
  _prevState: PanelUserFormState,
  formData: FormData,
): Promise<PanelUserFormState> {
  await requirePermission("role:manage");

  const parsed = panelUserFormSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { email, full_name, password, role } = parsed.data;
  const admin = createAdminClient();

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    const message =
      createError?.code === "email_exists"
        ? "Ya existe una cuenta con ese correo."
        : "No se pudo crear el usuario. Intenta de nuevo.";
    return { error: message };
  }

  const { error: insertError } = await admin
    .from("panel_users")
    .insert({ user_id: created.user.id, role, full_name });

  if (insertError) {
    // Roll back the orphaned auth user so a retry doesn't hit "ya existe".
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "No se pudo asignar el rol. Intenta de nuevo." };
  }

  await writeAuditLog({
    action: "create",
    resource: "panel_user",
    recordId: created.user.id,
    newValues: { email, full_name, role },
  });

  revalidatePath("/panel-users");
  return { success: true };
}

export async function updatePanelUserRole(userId: string, role: PanelRole) {
  const session = await requirePermission("role:manage");

  if (userId === session.userId) {
    throw new Error("No puedes cambiar tu propio rol.");
  }

  const admin = createAdminClient();
  const { data: before } = await admin
    .from("panel_users")
    .select("role")
    .eq("user_id", userId)
    .single();

  const { error } = await admin
    .from("panel_users")
    .update({ role })
    .eq("user_id", userId);
  if (error) throw new Error("No se pudo actualizar el rol.");

  await writeAuditLog({
    action: "update",
    resource: "panel_user",
    recordId: userId,
    oldValues: before,
    newValues: { role },
  });

  revalidatePath("/panel-users");
}

export async function togglePanelUserActive(userId: string, active: boolean) {
  const session = await requirePermission("role:manage");

  if (userId === session.userId) {
    throw new Error("No puedes desactivar tu propia cuenta.");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("panel_users")
    .update({ active })
    .eq("user_id", userId);
  if (error) throw new Error("No se pudo actualizar el estado.");

  await writeAuditLog({
    action: "update",
    resource: "panel_user",
    recordId: userId,
    newValues: { active },
  });

  revalidatePath("/panel-users");
}
