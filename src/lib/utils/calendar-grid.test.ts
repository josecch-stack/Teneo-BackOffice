import { describe, expect, it } from "vitest";
import { getMonthGridDays } from "./calendar-grid";

describe("getMonthGridDays", () => {
  it("returns a multiple of 7 days", () => {
    const days = getMonthGridDays(new Date("2026-08-13"));
    expect(days.length % 7).toBe(0);
  });

  it("starts on a Monday and ends on a Sunday", () => {
    const days = getMonthGridDays(new Date("2026-08-13"));
    expect(days[0].getDay()).toBe(1);
    expect(days[days.length - 1].getDay()).toBe(0);
  });

  it("covers every day of the given month", () => {
    const days = getMonthGridDays(new Date("2026-08-13"));
    const inAugust = days.filter((d) => d.getMonth() === 7);
    expect(inAugust[0].getDate()).toBe(1);
    expect(inAugust[inAugust.length - 1].getDate()).toBe(31);
    expect(inAugust).toHaveLength(31);
  });

  it("includes leading/trailing days from adjacent months to fill the grid", () => {
    // August 1, 2026 is a Saturday, so the grid must lead with days from July.
    const days = getMonthGridDays(new Date("2026-08-13"));
    expect(days[0].getMonth()).toBe(6);
  });
});
