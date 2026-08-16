import { describe, expect, it } from "vitest";
import { formatRut, isValidRut } from "./rut";

describe("isValidRut", () => {
  it("accepts a valid RUT without formatting", () => {
    expect(isValidRut("111111111")).toBe(true);
  });

  it("accepts a valid RUT with dash", () => {
    expect(isValidRut("11111111-1")).toBe(true);
  });

  it("accepts a valid RUT with dots and dash", () => {
    expect(isValidRut("11.111.111-1")).toBe(true);
  });

  it("accepts a valid RUT with a different check digit", () => {
    expect(isValidRut("12345678-5")).toBe(true);
  });

  it("accepts a lowercase k check digit", () => {
    // 11111112 -> check digit K
    expect(isValidRut("11111112-k")).toBe(true);
  });

  it("rejects a wrong check digit", () => {
    expect(isValidRut("11111111-2")).toBe(false);
  });

  it("rejects a non-numeric body", () => {
    expect(isValidRut("abcdefgh-1")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidRut("")).toBe(false);
  });

  it("rejects a single character", () => {
    expect(isValidRut("1")).toBe(false);
  });
});

describe("formatRut", () => {
  it("formats a clean RUT as 12345678-9", () => {
    expect(formatRut("111111111")).toBe("11111111-1");
  });

  it("normalizes dots and existing dash", () => {
    expect(formatRut("11.111.111-1")).toBe("11111111-1");
  });

  it("uppercases a lowercase k check digit", () => {
    expect(formatRut("11111112-k")).toBe("11111112-K");
  });
});
