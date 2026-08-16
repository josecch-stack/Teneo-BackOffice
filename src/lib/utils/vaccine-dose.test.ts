import { describe, expect, it } from "vitest";
import { calculateNextVaccineDose } from "./vaccine-dose";

describe("calculateNextVaccineDose", () => {
  it("adds 21 days for refuerzo in dogs", () => {
    const result = calculateNextVaccineDose(
      "perro",
      "refuerzo",
      new Date("2026-01-01"),
    );
    expect(result?.toISOString().slice(0, 10)).toBe("2026-01-22");
  });

  it("adds 1 year for anual in cats", () => {
    const result = calculateNextVaccineDose(
      "gato",
      "anual",
      new Date("2026-01-01"),
    );
    expect(result?.toISOString().slice(0, 10)).toBe("2027-01-01");
  });

  it("returns null for species other than perro/gato (manual entry required)", () => {
    expect(
      calculateNextVaccineDose("conejo", "refuerzo", new Date("2026-01-01")),
    ).toBeNull();
    expect(
      calculateNextVaccineDose("ave", "anual", new Date("2026-01-01")),
    ).toBeNull();
    expect(
      calculateNextVaccineDose("otro", "refuerzo", new Date("2026-01-01")),
    ).toBeNull();
  });

  it("next dose is never before the application date", () => {
    const applicationDate = new Date("2026-06-15");
    const refuerzo = calculateNextVaccineDose(
      "perro",
      "refuerzo",
      applicationDate,
    );
    const anual = calculateNextVaccineDose("perro", "anual", applicationDate);
    expect(refuerzo!.getTime()).toBeGreaterThan(applicationDate.getTime());
    expect(anual!.getTime()).toBeGreaterThan(applicationDate.getTime());
  });

  it("handles year-end rollover for refuerzo", () => {
    const result = calculateNextVaccineDose(
      "gato",
      "refuerzo",
      new Date("2026-12-20"),
    );
    expect(result?.toISOString().slice(0, 10)).toBe("2027-01-10");
  });
});
