/**
 * Chilean mobile phone utilities. Canonical format: +569XXXXXXXX
 * (country code 56, mobile prefix 9, 8 digits).
 */

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Normalizes common input shapes ("+56 9 1234 5678", "912345678", "56912345678")
 * to "+569XXXXXXXX". Returns null if it doesn't resolve to a valid Chilean mobile number. */
export function normalizePhone(phone: string): string | null {
  let digits = digitsOnly(phone);

  if (digits.startsWith("56")) {
    digits = digits.slice(2);
  }
  if (digits.length === 9 && digits.startsWith("9")) {
    digits = digits.slice(1);
  }

  if (digits.length !== 8 || !/^\d{8}$/.test(digits)) {
    return null;
  }

  return `+569${digits}`;
}

export function isValidPhone(phone: string): boolean {
  return normalizePhone(phone) !== null;
}
