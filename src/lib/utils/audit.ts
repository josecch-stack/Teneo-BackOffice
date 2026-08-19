// Vocabulary is fixed by the codebase itself: write_audit_log() is the only
// writer (see src/lib/audit/log.ts), so every action/resource pair that will
// ever show up here already exists as a literal in some *actions.ts file.
// Static list instead of a `select distinct` — cheaper, and doesn't miss
// values that haven't been logged yet.
export const AUDIT_ACTION_OPTIONS = [
  { value: "create", label: "Creación" },
  { value: "update", label: "Edición" },
  { value: "delete", label: "Eliminación" },
  { value: "export", label: "Exportación" },
  { value: "view_file", label: "Vista de archivo" },
  { value: "replace", label: "Reemplazo de archivo" },
  { value: "send", label: "Envío" },
  { value: "login", label: "Inicio de sesión" },
  { value: "logout", label: "Cierre de sesión" },
] as const;

export const AUDIT_ACTION_LABELS: Record<string, string> = Object.fromEntries(
  AUDIT_ACTION_OPTIONS.map((o) => [o.value, o.label]),
);

export const AUDIT_RESOURCE_OPTIONS = [
  { value: "pet", label: "Mascota" },
  { value: "owner", label: "Tutor" },
  { value: "panel_user", label: "Usuario del panel" },
  { value: "vaccine", label: "Vacuna" },
  { value: "deworming", label: "Desparasitación" },
  { value: "clinical_note", label: "Nota clínica" },
  { value: "lab_exam", label: "Examen de laboratorio" },
  { value: "imaging_exam", label: "Examen de imagenología" },
  { value: "exam_file", label: "Archivo de examen" },
  { value: "document", label: "Documento" },
  { value: "notification", label: "Notificación" },
  { value: "pet_carnet", label: "Carnet digital" },
  { value: "owners_report", label: "Reporte de tutores" },
  { value: "pets_report", label: "Reporte de mascotas" },
  { value: "auth", label: "Sesión" },
  { value: "auth_password", label: "Contraseña" },
] as const;

export const AUDIT_RESOURCE_LABELS: Record<string, string> = Object.fromEntries(
  AUDIT_RESOURCE_OPTIONS.map((o) => [o.value, o.label]),
);
