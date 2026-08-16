/** Computes age from a birth date as { years, months }, relative to `now` (defaults to today). */
export function calculateAge(
  birthDate: Date,
  now: Date = new Date(),
): { years: number; months: number } {
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();

  if (now.getDate() < birthDate.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years: Math.max(years, 0), months: Math.max(months, 0) };
}

/** Formats age as "2 años 3 meses", "8 meses", or "recién nacido" for < 1 month. */
export function formatAge(birthDate: Date, now: Date = new Date()): string {
  const { years, months } = calculateAge(birthDate, now);

  if (years === 0 && months === 0) return "recién nacido";

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "año" : "años"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "mes" : "meses"}`);
  return parts.join(" ");
}
