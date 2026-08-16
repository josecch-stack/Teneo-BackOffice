import "server-only";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

interface AuditLogParams {
  action: string; // 'create' | 'update' | 'delete' | 'export' | 'view_file' | 'send_notification' | 'login' | ...
  resource: string; // 'pet' | 'owner' | 'vaccine' | 'subscription' | 'auth' | ...
  recordId?: string;
  oldValues?: Json;
  newValues?: Json;
}

/**
 * Calls the write_audit_log RPC proposed in
 * docs/migrations-propuestas.md (Propuesta 2). That migration hasn't been
 * applied yet, so this currently fails silently (logged to console) instead
 * of throwing — callers should not depend on audit writes succeeding until
 * the migration lands.
 */
export async function writeAuditLog({
  action,
  resource,
  recordId,
  oldValues,
  newValues,
}: AuditLogParams) {
  const supabase = await createClient();
  const headerList = await headers();

  const { error } = await supabase.rpc("write_audit_log", {
    p_action: action,
    p_resource: resource,
    p_record_id: recordId ?? null,
    p_old_values: oldValues ?? null,
    p_new_values: newValues ?? null,
    p_ip: headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    p_user_agent: headerList.get("user-agent") ?? null,
  });

  if (error) {
    console.error("writeAuditLog failed", {
      action,
      resource,
      recordId,
      error,
    });
  }
}
