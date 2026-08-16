import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * service_role client — bypasses RLS. Only for Server Actions that need the
 * Auth Admin API (creating auth.users accounts) or write to panel_users,
 * which has no client-writable RLS policy by design: "nadie la escribe
 * directo desde el cliente" (docs/migrations-propuestas.md, Propuesta 1).
 * Every caller must gate access with requirePermission() first.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
