import { z } from "zod";

export const VACCINE_APPLICATION_TYPE_OPTIONS = [
  { value: "refuerzo", label: "Refuerzo" },
  { value: "anual", label: "Anual" },
] as const;

export const vaccineFormSchema = z
  .object({
    pet_id: z.uuid("Selecciona una mascota."),
    application_type: z.enum(
      ["refuerzo", "anual"],
      "Selecciona el tipo de aplicación.",
    ),
    vaccine_catalog_id: z.coerce.number().int().positive().optional(),
    vaccine_name: z.string().trim().optional(),
    application_date: z
      .string()
      .min(1, "La fecha de aplicación es obligatoria."),
    next_dose_date: z.string().optional(),
    lab_catalog_id: z.coerce.number().int().positive().optional(),
    brand_lab: z.string().trim().optional(),
    batch_code: z.string().trim().optional(),
    vet_center: z.string().trim().optional(),
    vet_name: z.string().trim().optional(),
  })
  .refine((data) => data.vaccine_catalog_id || data.vaccine_name, {
    message: "Elige una vacuna del catálogo o escribe el nombre.",
    path: ["vaccine_name"],
  })
  .refine(
    (data) =>
      !data.next_dose_date || data.next_dose_date >= data.application_date,
    {
      message:
        "La próxima dosis no puede ser anterior a la fecha de aplicación.",
      path: ["next_dose_date"],
    },
  );

export type VaccineFormValues = z.infer<typeof vaccineFormSchema>;
