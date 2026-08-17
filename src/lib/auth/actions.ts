"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/log";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${h.get("host")}`;
}

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

  // 5 attempts / 15 min per IP — brute-force guard on the credential check
  // below, not on validation errors above (those never reach Supabase).
  const ip = await getClientIp();
  if (!checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return {
      error: "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
    };
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

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Ingresa un correo válido." }),
});

export interface ForgotPasswordState {
  error?: string;
  success?: boolean;
}

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: "Ingresa un correo válido." };
  }

  // 3 requests / hour per IP — also protects Supabase's own (much stricter)
  // email-send rate limit from being burned by repeated clicks. Same
  // never-reveal posture as below: rate-limited requests still report
  // success, just skip the actual send.
  const ip = await getClientIp();
  if (!checkRateLimit(`reset:${ip}`, 3, 60 * 60 * 1000)) {
    return { success: true };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  // No query string on redirectTo on purpose: Supabase validates this exact
  // string against the Redirect URLs allowlist before appending the ?code=
  // it comes back with (see docs/deploy-checklist.md). The code itself is
  // exchanged by exchangeRecoveryCode below, from a Server Action — not from
  // reset-password/page.tsx (a Server Component), which can read cookies
  // but can't durably set them; the exchanged session would only live for
  // that one render and vanish before the password-update submit.
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${origin}/reset-password`,
    },
  );
  // Never surfaced to the client (would leak account existence / internals)
  // — logged server-side only, e.g. to catch Supabase's email rate limit.
  if (resetError) console.error("requestPasswordReset:", resetError.message);

  return { success: true };
}

// Called directly (not as a <form action>) from reset-password-form.tsx on
// mount, when the page loaded with a Supabase ?code= param. Server Actions
// can set cookies; the page component that reads the param cannot.
export async function exchangeRecoveryCode(code: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return !error;
}

const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
});

export interface UpdatePasswordState {
  error?: string;
}

export async function updatePassword(
  _prevState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const parsed = UpdatePasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "El enlace expiró o no es válido. Solicita uno nuevo desde 'Olvidaste tu contraseña'.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: "No se pudo actualizar la contraseña. Intenta de nuevo." };
  }

  await writeAuditLog({ action: "update", resource: "auth_password" });

  redirect("/");
}
