import { z } from "zod";

export const CLINICAL_EVENT_TYPE_OPTIONS = [
  { value: "consulta", label: "Consulta" },
  { value: "examen", label: "Examen" },
  { value: "cirugia", label: "Cirugía" },
  { value: "otro", label: "Otro" },
] as const;

export const CLINICAL_EVENT_TYPE_LABELS: Record<string, string> =
  Object.fromEntries(
    CLINICAL_EVENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
  );

export const medicationSchema = z.object({
  name: z.string().trim().min(1, "El nombre del medicamento es obligatorio."),
  dosage: z.string().trim().optional(),
  frequency_hours: z.coerce.number().int().positive().optional(),
  duration_days: z.coerce.number().int().positive().optional(),
  start_datetime: z.string().optional(),
});

export const clinicalNoteFormSchema = z.object({
  pet_id: z.uuid("Selecciona una mascota."),
  event_type: z.enum(["consulta", "examen", "cirugia", "otro"]).optional(),
  event_date: z.string().min(1, "La fecha es obligatoria."),
  reason: z.string().trim().optional(),
  veterinarian: z.string().trim().optional(),
  clinic: z.string().trim().optional(),
  notes_diagnosis: z
    .string()
    .trim()
    .min(1, "El diagnóstico/notas es obligatorio."),
  has_prescription: z.boolean(),
  general_instructions: z.string().trim().optional(),
  prescription_date: z.string().optional(),
  next_checkup_date: z.string().optional(),
});

export type ClinicalNoteFormValues = z.infer<typeof clinicalNoteFormSchema>;
export type MedicationFormValues = z.infer<typeof medicationSchema>;
