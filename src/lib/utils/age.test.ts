import { describe, expect, it } from "vitest";
import { calculateAge, formatAge } from "./age";

const REF = new Date("2026-08-13");

describe("calculateAge", () => {
  it("computes whole years with no remaining months", () => {
    expect(calculateAge(new Date("2023-08-13"), REF)).toEqual({
      years: 3,
      months: 0,
    });
  });

  it("computes years and months", () => {
    expect(calculateAge(new Date("2023-05-01"), REF)).toEqual({
      years: 3,
      months: 3,
    });
  });

  it("has not yet reached the monthly anniversary this month", () => {
    // birthday day-of-month (20) is after "today" (13), so the current month doesn't count yet
    expect(calculateAge(new Date("2026-01-20"), REF)).toEqual({
      years: 0,
      months: 6,
    });
  });

  it("computes age for a pet born earlier this year", () => {
    expect(calculateAge(new Date("2026-01-01"), REF)).toEqual({
      years: 0,
      months: 7,
    });
  });

  it("never returns negative values for a future date", () => {
    const result = calculateAge(new Date("2027-01-01"), REF);
    expect(result.years).toBeGreaterThanOrEqual(0);
    expect(result.months).toBeGreaterThanOrEqual(0);
  });
});

describe("formatAge", () => {
  it("formats years and months", () => {
    expect(formatAge(new Date("2023-05-01"), REF)).toBe("3 años 3 meses");
  });

  it("formats a single year without months", () => {
    expect(formatAge(new Date("2025-08-13"), REF)).toBe("1 año");
  });

  it("formats months only, under a year old", () => {
    expect(formatAge(new Date("2026-01-01"), REF)).toBe("7 meses");
  });

  it("formats a newborn as recien nacido", () => {
    expect(formatAge(new Date("2026-08-01"), REF)).toBe("recién nacido");
  });
});
