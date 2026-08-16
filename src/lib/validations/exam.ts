import { z } from "zod";

export const EXAM_CATEGORY_OPTIONS = [
  { value: "hemograma", label: "Hemograma" },
  { value: "perfil_bioquimico", label: "Perfil bioquímico" },
  { value: "orina", label: "Orina" },
  { value: "copro", label: "Coprológico" },
  { value: "hormonas", label: "Hormonas" },
  { value: "otro", label: "Otro" },
] as const;

export const IMAGING_TYPE_OPTIONS = [
  { value: "rx", label: "Radiografía" },
  { value: "eco", label: "Ecografía" },
  { value: "tac", label: "TAC" },
  { value: "rm", label: "Resonancia magnética" },
  { value: "otro", label: "Otro" },
] as const;

export const EXAM_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  EXAM_CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
);
export const IMAGING_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  IMAGING_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

const todayISO = () => new Date().toISOString().slice(0, 10);

export const labExamFormSchema = z
  .object({
    pet_id: z.uuid("Selecciona una mascota."),
    clinical_note_id: z.uuid().optional(),
    exam_name: z.string().trim().min(1, "El nombre del examen es obligatorio."),
    category: z
      .enum([
        "hemograma",
        "perfil_bioquimico",
        "orina",
        "copro",
        "hormonas",
        "otro",
      ])
      .optional(),
    sample_date: z.string().optional(),
    result_date: z.string().min(1, "La fecha de resultado es obligatoria."),
    lab_center: z.string().trim().optional(),
    summary: z.string().trim().optional(),
  })
  .refine((data) => data.result_date <= todayISO(), {
    message: "La fecha de resultado no puede ser futura.",
    path: ["result_date"],
  })
  .refine((data) => !data.sample_date || data.sample_date <= todayISO(), {
    message: "La fecha de toma no puede ser futura.",
    path: ["sample_date"],
  })
  .refine((data) => !data.sample_date || data.result_date >= data.sample_date, {
    message:
      "La fecha de resultado debe ser igual o posterior a la fecha de toma.",
    path: ["result_date"],
  });

export const imagingExamFormSchema = z
  .object({
    pet_id: z.uuid("Selecciona una mascota."),
    clinical_note_id: z.uuid().optional(),
    image_type: z.enum(
      ["rx", "eco", "tac", "rm", "otro"],
      "Selecciona el tipo de imagen.",
    ),
    body_region: z.string().trim().optional(),
    exam_date: z.string().min(1, "La fecha es obligatoria."),
    vet_center: z.string().trim().optional(),
    findings: z.string().trim().optional(),
  })
  .refine((data) => data.exam_date <= todayISO(), {
    message: "La fecha del examen no puede ser futura.",
    path: ["exam_date"],
  });

export type LabExamFormValues = z.infer<typeof labExamFormSchema>;
export type ImagingExamFormValues = z.infer<typeof imagingExamFormSchema>;
