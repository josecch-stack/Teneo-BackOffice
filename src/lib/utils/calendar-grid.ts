import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

/** Full weeks (Mon-Sun) covering the given month — always a multiple of 7 days. */
export function getMonthGridDays(monthDate: Date): Date[] {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}
