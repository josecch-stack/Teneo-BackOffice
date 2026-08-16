import { z } from "zod";

export const DEWORMING_TYPE_OPTIONS = [
  { value: "interna", label: "Interna" },
  { value: "externa", label: "Externa" },
  { value: "mixta", label: "Mixta" },
] as const;

export const dewormingFormSchema = z.object({
  pet_id: z.uuid("Selecciona una mascota."),
  type: z.enum(["interna", "externa", "mixta"], "Selecciona el tipo."),
  product: z.string().trim().min(1, "El producto es obligatorio."),
  application_date: z.string().min(1, "La fecha de aplicación es obligatoria."),
  next_dose_date: z.string().optional(),
  weight_kg: z.coerce.number().positive().optional(),
  dosage: z.string().trim().optional(),
});

export type DewormingFormValues = z.infer<typeof dewormingFormSchema>;
