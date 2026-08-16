export const CALENDAR_EVENT_TYPES = [
  "vacuna",
  "desparasitacion",
  "consulta",
  "cirugia",
  "control",
  "examen_lab",
  "examen_imagen",
  "fin_tratamiento",
  "otro",
] as const;

export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];

export const CALENDAR_EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  vacuna: "Vacuna",
  desparasitacion: "Desparasitación",
  consulta: "Consulta",
  cirugia: "Cirugía",
  control: "Control",
  examen_lab: "Examen de laboratorio",
  examen_imagen: "Examen de imagenología",
  fin_tratamiento: "Fin de tratamiento",
  otro: "Otro",
};

/** Dot + badge color per type — always paired with the label above, never color-alone. */
export const CALENDAR_EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  vacuna: "bg-blue-500",
  desparasitacion: "bg-emerald-500",
  consulta: "bg-violet-500",
  cirugia: "bg-red-500",
  control: "bg-amber-500",
  examen_lab: "bg-cyan-500",
  examen_imagen: "bg-fuchsia-500",
  fin_tratamiento: "bg-orange-500",
  otro: "bg-gray-400",
};

const SOURCE_MODULE_ROUTES: Record<string, string> = {
  vaccines: "/vaccines",
  dewormings: "/dewormings",
  clinical_notes: "/clinical-notes",
  lab_exams: "/exams/lab",
  imaging_exams: "/exams/imaging",
};

/**
 * Prescriptions/medications-sourced events (control, fin_tratamiento) don't
 * have their own detail route — they're edited inline within their parent
 * clinical note — so this returns null for those and the UI renders plain
 * text instead of a link.
 */
export function calendarEventHref(
  sourceModule: string,
  sourceId: string,
): string | null {
  const base = SOURCE_MODULE_ROUTES[sourceModule];
  return base ? `${base}/${sourceId}` : null;
}
