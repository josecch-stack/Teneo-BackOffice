import { z } from "zod";
import { isValidPhone } from "@/lib/utils/phone";

export const SPECIES_OPTIONS = [
  { value: "perro", label: "Perro" },
  { value: "gato", label: "Gato" },
  { value: "conejo", label: "Conejo" },
  { value: "ave", label: "Ave" },
  { value: "reptil", label: "Reptil" },
  { value: "otro", label: "Otro" },
] as const;

export const SEX_OPTIONS = [
  { value: "macho", label: "Macho" },
  { value: "hembra", label: "Hembra" },
] as const;

export const petFormSchema = z
  .object({
    owner_id: z.uuid("Selecciona un tutor."),
    name: z.string().trim().min(1, "El nombre es obligatorio."),
    species: z.enum(["perro", "gato", "conejo", "ave", "reptil", "otro"]),
    custom_species: z.string().trim().optional().or(z.literal("")),
    breed: z.string().trim().optional().or(z.literal("")),
    birth_date: z.string().min(1, "La fecha de nacimiento es obligatoria."),
    sex: z.enum(["macho", "hembra"]).optional(),
    color: z.string().trim().optional().or(z.literal("")),
    weight_kg: z.coerce.number().positive().optional(),
    is_sterilized: z.boolean().default(false),
    health_notes: z.string().trim().optional().or(z.literal("")),
    chip_number: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || /^\d{10,15}$/.test(value), {
        message: "El N° de chip debe tener entre 10 y 15 dígitos.",
      }),
    vet_name: z.string().trim().optional().or(z.literal("")),
    vet_phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || isValidPhone(value), {
        message:
          "Teléfono inválido — debe ser un móvil chileno (+569 + 8 dígitos).",
      }),
  })
  .refine((data) => data.species !== "otro" || data.custom_species, {
    message: "Especifica la especie cuando eliges 'Otro'.",
    path: ["custom_species"],
  });

export type PetFormValues = z.infer<typeof petFormSchema>;
