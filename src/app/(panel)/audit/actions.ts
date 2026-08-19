"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/dal";
import type { PanelRole } from "@/lib/auth/dal";
import type { Json } from "@/types/database.types";

const PAGE_SIZE = 25;

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  actor_role: PanelRole | null;
  actor_email: string;
  action: string;
  resource: string;
  record_id: string | null;
  old_values: Json | null;
  new_values: Json | null;
  ip_address: string | null;
  created_at: string;
}

export interface ListAuditLogParams {
  action?: string;
  resource?: string;
  actorId?: string;
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  page?: number;
}

/**
 * audit_log.actor_id references auth.users but doesn't store email (same
 * gap panel_users has — see panel-users/actions.ts). Resolved once per page
 * load via the Admin API, not per row.
 */
async function emailsByUserId(): Promise<Map<string, string>> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  return new Map(data?.users.map((u) => [u.id, u.email ?? "—"]));
}

export async function listAuditLog(params: ListAuditLogParams) {
  await requirePermission("audit:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("audit_log")
    .select(
      "id, actor_id, actor_role, action, resource, record_id, old_values, new_values, ip_address, created_at",
      { count: "exact" },
    );

  if (params.action) query = query.eq("action", params.action);
  if (params.resource) query = query.eq("resource", params.resource);
  if (params.actorId) query = query.eq("actor_id", params.actorId);
  if (params.from) query = query.gte("created_at", `${params.from}T00:00:00`);
  if (params.to) query = query.lte("created_at", `${params.to}T23:59:59`);

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("listAuditLog failed", error);
    return { rows: [], rowCount: 0, pageCount: 1, page };
  }

  const emailById = await emailsByUserId();
  const rows: AuditLogRow[] = (data ?? []).map((r) => ({
    ...r,
    actor_email: r.actor_id
      ? (emailById.get(r.actor_id) ?? "Cuenta eliminada")
      : "Sistema",
  }));

  const rowCount = count ?? 0;
  return {
    rows,
    rowCount,
    pageCount: Math.max(Math.ceil(rowCount / PAGE_SIZE), 1),
    page,
  };
}

export interface AuditActorOption {
  id: string;
  label: string;
}

/**
 * Panel accounts only (a handful) — for the "Actor" filter dropdown.
 * Deliberately not "every auth.users row": a tutor account can never be an
 * actor here (writeAuditLog only runs from panel Server Actions).
 */
export async function listAuditActors(): Promise<AuditActorOption[]> {
  await requirePermission("audit:read");
  const admin = createAdminClient();

  const { data: panelUsers } = await admin
    .from("panel_users")
    .select("user_id, full_name")
    .order("full_name");
  if (!panelUsers) return [];

  const emailById = await emailsByUserId();
  return panelUsers.map((u) => ({
    id: u.user_id,
    label: emailById.get(u.user_id)
      ? `${u.full_name} (${emailById.get(u.user_id)})`
      : u.full_name,
  }));
}
