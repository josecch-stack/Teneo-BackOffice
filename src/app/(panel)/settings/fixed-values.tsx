import { SPECIES_OPTIONS, SEX_OPTIONS } from "@/lib/validations/pet";
import { DEWORMING_TYPE_OPTIONS } from "@/lib/validations/deworming";
import { VACCINE_APPLICATION_TYPE_OPTIONS } from "@/lib/validations/vaccine";
import { CLINICAL_EVENT_TYPE_OPTIONS } from "@/lib/validations/clinical-note";
import {
  EXAM_CATEGORY_OPTIONS,
  IMAGING_TYPE_OPTIONS,
} from "@/lib/validations/exam";
import { Badge } from "@/components/ui/badge";

interface OptionGroup {
  title: string;
  options: readonly { value: string; label: string }[];
}

const GROUPS: OptionGroup[] = [
  { title: "Especies", options: SPECIES_OPTIONS },
  { title: "Sexo", options: SEX_OPTIONS },
  { title: "Tipo de desparasitación", options: DEWORMING_TYPE_OPTIONS },
  {
    title: "Tipo de aplicación de vacuna",
    options: VACCINE_APPLICATION_TYPE_OPTIONS,
  },
  { title: "Tipo de evento clínico", options: CLINICAL_EVENT_TYPE_OPTIONS },
  {
    title: "Categoría de examen de laboratorio",
    options: EXAM_CATEGORY_OPTIONS,
  },
  { title: "Tipo de examen de imagen", options: IMAGING_TYPE_OPTIONS },
];

/**
 * These are Postgres enums the mobile app already depends on (species_type,
 * deworming_type, vaccine_application_type, clinical_event_type,
 * exam_category, imaging_type) — per G5, converting them to editable tables
 * risks breaking app-side validation for no real benefit, so this is a
 * read-only mirror of the option lists already used by the panel's own
 * forms. No database access, nothing to fetch.
 */
export function FixedValuesCatalog() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {GROUPS.map((group) => (
        <div
          key={group.title}
          className="border-border flex flex-col gap-2 rounded-md border p-4"
        >
          <h3 className="text-foreground text-sm font-bold">{group.title}</h3>
          <div className="flex flex-wrap gap-1.5">
            {group.options.map((option) => (
              <Badge key={option.value} variant="outline">
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
