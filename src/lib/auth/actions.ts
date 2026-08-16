"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/log";

const LoginSchema = z.object({
  email: z.string().email({ message: "Ingresa un correo válido." }),
  password: z.string().min(1, { message: "Ingresa tu contraseña." }),
});

export interface LoginState {
  error?: string;
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Correo o contraseña inválidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.session) {
    return { error: "Credenciales incorrectas." };
  }

  // Panel accounts are a subset of auth.users flagged via panel_users (see
  // docs/migrations-propuestas.md). A mobile-app tutor account authenticates
  // fine but must never get into the panel.
  const { data: claimsData } = await supabase.auth.getClaims();
  const panelRole = (claimsData?.claims as { panel_role?: string } | undefined)
    ?.panel_role;

  if (!panelRole) {
    await supabase.auth.signOut();
    return { error: "Esta cuenta no tiene acceso al panel de administración." };
  }

  await writeAuditLog({ action: "login", resource: "auth" });

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await writeAuditLog({ action: "logout", resource: "auth" });
  await supabase.auth.signOut();
  redirect("/login");
}
