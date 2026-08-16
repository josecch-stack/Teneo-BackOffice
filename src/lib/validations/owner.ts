import { z } from "zod";
import { isValidRut } from "@/lib/utils/rut";
import { isValidPhone } from "@/lib/utils/phone";

export const ownerFormSchema = z.object({
  first_name: z.string().trim().min(1, "El nombre es obligatorio."),
  last_name: z.string().trim().optional().or(z.literal("")),
  rut: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || isValidRut(value), {
      message: "RUT inválido (dígito verificador no coincide).",
    }),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || isValidPhone(value), {
      message:
        "Teléfono inválido — debe ser un móvil chileno (+569 + 8 dígitos).",
    }),
  email: z.email("Correo inválido.").optional().or(z.literal("")),
  region_id: z.coerce.number().int().positive().optional(),
  commune_id: z.coerce.number().int().positive().optional(),
  address: z.string().trim().optional().or(z.literal("")),
  condo_building: z.string().trim().optional().or(z.literal("")),
  apt_house: z.string().trim().optional().or(z.literal("")),
});

export type OwnerFormValues = z.infer<typeof ownerFormSchema>;
