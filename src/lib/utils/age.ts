/**
 * Computes age from a birth date as { years, months }, relative to `now`
 * (defaults to today). Uses UTC getters, not local-time ones: birth_date is
 * a date-only Postgres column (parses as UTC midnight), and a "use client"
 * caller renders once on the server (Railway, UTC) and once on hydration
 * (visitor's browser, Chile) — local getters would read a different
 * calendar day in each environment and hydration-mismatch.
 */
export function calculateAge(
  birthDate: Date,
  now: Date = new Date(),
): { years: number; months: number } {
  let years = now.getUTCFullYear() - birthDate.getUTCFullYear();
  let months = now.getUTCMonth() - birthDate.getUTCMonth();

  if (now.getUTCDate() < birthDate.getUTCDate()) {
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
