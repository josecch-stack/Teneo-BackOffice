import { describe, expect, it } from "vitest";
import { getMonthGridDays } from "./calendar-grid";

// UTC getters throughout — the grid is built with Date.UTC and is only
// ever meant to be read the same way (see calendar-grid.ts for why: local
// getters would give a different answer on a server vs. a Chilean browser).
describe("getMonthGridDays", () => {
  it("returns a multiple of 7 days", () => {
    const days = getMonthGridDays(new Date("2026-08-13"));
    expect(days.length % 7).toBe(0);
  });

  it("starts on a Monday and ends on a Sunday", () => {
    const days = getMonthGridDays(new Date("2026-08-13"));
    expect(days[0].getUTCDay()).toBe(1);
    expect(days[days.length - 1].getUTCDay()).toBe(0);
  });

  it("covers every day of the given month", () => {
    const days = getMonthGridDays(new Date("2026-08-13"));
    const inAugust = days.filter((d) => d.getUTCMonth() === 7);
    expect(inAugust[0].getUTCDate()).toBe(1);
    expect(inAugust[inAugust.length - 1].getUTCDate()).toBe(31);
    expect(inAugust).toHaveLength(31);
  });

  it("includes leading/trailing days from adjacent months to fill the grid", () => {
    // August 1, 2026 is a Saturday, so the grid must lead with days from July.
    const days = getMonthGridDays(new Date("2026-08-13"));
    expect(days[0].getUTCMonth()).toBe(6);
  });
});
