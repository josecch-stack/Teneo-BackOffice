/**
 * Chilean RUT (Rol Único Tributario) utilities.
 * Check digit algorithm: Módulo 11.
 */

function clean(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

function computeCheckDigit(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
}

/** Validates a RUT of shape "12345678-9", "12.345.678-9", or "123456789". */
export function isValidRut(rut: string): boolean {
  const cleaned = clean(rut);
  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  const providedCheckDigit = cleaned.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  return computeCheckDigit(body) === providedCheckDigit;
}

/** Formats a RUT as "12345678-9". Returns the input unchanged if it can't be parsed. */
export function formatRut(rut: string): string {
  const cleaned = clean(rut);
  if (cleaned.length < 2) return rut;

  const body = cleaned.slice(0, -1);
  const checkDigit = cleaned.slice(-1);
  return `${body}-${checkDigit}`;
}
