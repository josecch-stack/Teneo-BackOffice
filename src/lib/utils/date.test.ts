import { describe, expect, it } from "vitest";
import { formatDateCL, formatDateTimeCL } from "./date";

describe("formatDateCL", () => {
  it("formats a date-only ISO string as dd/MM/yyyy", () => {
    expect(formatDateCL("2026-08-13")).toBe("13/08/2026");
  });

  it("formats a UTC timestamp using the America/Santiago calendar day", () => {
    // 2026-08-13T02:00:00Z is 2026-08-12 22:00 in Chile (UTC-4 in August,
    // no DST) — this is exactly the case that used to hydration-mismatch:
    // a server in UTC and a browser in Chile disagreeing on which day it is.
    expect(formatDateCL("2026-08-13T02:00:00Z")).toBe("12/08/2026");
  });

  it("pads single-digit day and month", () => {
    expect(formatDateCL("2026-01-05")).toBe("05/01/2026");
  });
});

describe("formatDateTimeCL", () => {
  it("formats date and 24h time together", () => {
    // 2026-08-13T15:30:00Z is 11:30 in Chile (UTC-4 in August).
    expect(formatDateTimeCL("2026-08-13T15:30:00Z")).toBe("13/08/2026 11:30");
  });
});
