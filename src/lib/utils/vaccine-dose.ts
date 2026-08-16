/**
 * Mirrors the DB trigger `calculate_next_vaccine_dose` (public schema) —
 * used here only to preview the value in the UI before save. The database
 * trigger is the actual source of truth and recomputes it on insert/update
 * regardless of what's submitted.
 */
export type Species = "perro" | "gato" | "conejo" | "ave" | "reptil" | "otro";
export type VaccineApplicationType = "refuerzo" | "anual";

export function calculateNextVaccineDose(
  species: Species,
  applicationType: VaccineApplicationType,
  applicationDate: Date,
): Date | null {
  if (species !== "perro" && species !== "gato") return null;

  const next = new Date(applicationDate);
  if (applicationType === "refuerzo") {
    next.setDate(next.getDate() + 21);
    return next;
  }
  if (applicationType === "anual") {
    next.setFullYear(next.getFullYear() + 1);
    return next;
  }
  return null;
}
