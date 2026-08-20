const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Full weeks (Mon-Sun) covering the given month — always a multiple of 7
 * days. Pure UTC arithmetic, no date-fns: this is called from a "use
 * client" component that server-renders once (Railway, UTC) and hydrates
 * once (the visitor's browser) — date-fns' startOfMonth/eachDayOfInterval
 * read the *local* system timezone, so the exact same monthDate would
 * produce a different grid in each environment and hydration-mismatch.
 * `monthDate` is expected to represent a UTC-midnight instant (see
 * calendar/page.tsx's parseMonthParam) — every day here is built the same
 * way, so grid membership only ever depends on UTC calendar math.
 */
export function getMonthGridDays(monthDate: Date): Date[] {
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();

  const firstOfMonth = Date.UTC(year, month, 1);
  const lastOfMonth = Date.UTC(year, month + 1, 0);

  // UTC day-of-week (0=Sun..6=Sat) remapped to Mon=0..Sun=6.
  const isoWeekday = (d: number) => (d + 6) % 7;
  const leadingDays = isoWeekday(new Date(firstOfMonth).getUTCDay());
  const trailingDays = 6 - isoWeekday(new Date(lastOfMonth).getUTCDay());

  const start = firstOfMonth - leadingDays * MS_PER_DAY;
  const end = lastOfMonth + trailingDays * MS_PER_DAY;

  const days: Date[] = [];
  for (let t = start; t <= end; t += MS_PER_DAY) {
    days.push(new Date(t));
  }
  return days;
}

/** "YYYY-MM-DD" key for a UTC-anchored day, e.g. one produced by
 * getMonthGridDays — read via UTC getters, matching how it was built. */
export function dayKeyUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
