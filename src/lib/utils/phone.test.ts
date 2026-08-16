import { describe, expect, it } from "vitest";
import { isValidPhone, normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it("normalizes 8 bare digits", () => {
    expect(normalizePhone("12345678")).toBe("+56912345678");
  });

  it("normalizes 9 digits with leading 9", () => {
    expect(normalizePhone("912345678")).toBe("+56912345678");
  });

  it("normalizes with +56 prefix and spaces", () => {
    expect(normalizePhone("+56 9 1234 5678")).toBe("+56912345678");
  });

  it("normalizes with 56 prefix and dashes", () => {
    expect(normalizePhone("56-9-1234-5678")).toBe("+56912345678");
  });

  it("returns null for too few digits", () => {
    expect(normalizePhone("1234567")).toBeNull();
  });

  it("returns null for too many digits", () => {
    expect(normalizePhone("123456789012")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(normalizePhone("abcdefgh")).toBeNull();
  });
});

describe("isValidPhone", () => {
  it("accepts a valid number", () => {
    expect(isValidPhone("+56912345678")).toBe(true);
  });

  it("rejects an invalid number", () => {
    expect(isValidPhone("123")).toBe(false);
  });
});
