import { z } from "zod";
import type { PanelRole } from "@/lib/auth/dal";

// The 6 panel roles from prompt-backend-admin-teneo-pet.md section 4 — kept
// in sync with the PanelRole union in src/lib/auth/dal.ts and the panel_role
// enum in the database.
export const PANEL_ROLE_OPTIONS: { value: PanelRole; label: string }[] = [
  { value: "super_admin", label: "Super administrador" },
  { value: "admin", label: "Administrador" },
  { value: "clinic_manager", label: "Gestor de clínica" },
  { value: "veterinarian", label: "Veterinario" },
  { value: "support", label: "Soporte" },
  { value: "viewer", label: "Solo lectura" },
];

export const ROLE_LABELS = Object.fromEntries(
  PANEL_ROLE_OPTIONS.map((r) => [r.value, r.label]),
) as Record<PanelRole, string>;

const roleValues = PANEL_ROLE_OPTIONS.map((r) => r.value) as [
  PanelRole,
  ...PanelRole[],
];

export const panelUserFormSchema = z.object({
  email: z.email("Correo inválido."),
  full_name: z.string().trim().min(1, "El nombre es obligatorio."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
  role: z.enum(roleValues),
});

export type PanelUserFormValues = z.infer<typeof panelUserFormSchema>;
