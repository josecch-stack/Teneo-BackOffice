import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// The 6 panel roles from prompt-backend-admin-teneo-pet.md section 4.
// clinic_manager/veterinarian are NOT clinic_id-scoped — see docs/gaps.md G1.
export type PanelRole =
  | "super_admin"
  | "admin"
  | "clinic_manager"
  | "veterinarian"
  | "support"
  | "viewer";

export interface PanelSession {
  userId: string;
  email: string;
  role: PanelRole;
  permissions: string[];
}

interface PanelClaims {
  sub: string;
  email?: string;
  panel_role?: PanelRole;
  panel_permissions?: string[];
}

/**
 * Verifies the session and confirms the caller is a panel user (has a
 * panel_role claim — set by the custom_access_token_hook from
 * docs/migrations-propuestas.md). Redirects to /login otherwise.
 *
 * Wrapped in React's cache() so it's safe to call from multiple Server
 * Components/Actions during one render without duplicate auth calls.
 */
export const verifySession = cache(async (): Promise<PanelSession> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const claims = data.claims as PanelClaims;

  if (!claims.panel_role) {
    redirect("/login?error=not_panel_user");
  }

  return {
    userId: claims.sub,
    email: claims.email ?? "",
    role: claims.panel_role,
    permissions: claims.panel_permissions ?? [],
  };
});

export function hasPermission(
  session: PanelSession,
  permission: `${string}:${string}`,
) {
  return session.permissions.includes(permission);
}

/**
 * Use at the top of Server Actions / Route Handlers that mutate data.
 * Throws instead of redirecting — the caller is a form submission or API
 * call, not a page render.
 */
export async function requirePermission(permission: `${string}:${string}`) {
  const session = await verifySession();
  if (!hasPermission(session, permission)) {
    throw new Error(`Forbidden: falta el permiso "${permission}"`);
  }
  return session;
}
