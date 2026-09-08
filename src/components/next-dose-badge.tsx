import { isPast, differenceInCalendarDays } from "date-fns";
import { formatDateCL } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";

/**
 * A "pending" row's own `application_date` IS the due date (there's no
 * `next_dose_date` on it — that stays null until it's actually applied and a
 * new row is created for what comes after, see docs/migrations-propuestas.md
 * on the dose_status model). An "applied" row's `next_dose_date` is what's
 * relevant instead — the pending row for that date normally exists
 * separately. `cancelled` has no meaningful upcoming date at all.
 */
export function NextDoseBadge({
  status,
  applicationDate,
  nextDoseDate,
}: {
  status?: "pending" | "applied" | "cancelled" | string | null;
  applicationDate?: string | null;
  nextDoseDate: string | null;
}) {
  const relevantDate =
    status === "pending"
      ? applicationDate
      : status === "cancelled"
        ? null
        : nextDoseDate;

  if (!relevantDate) return <span className="text-muted-foreground">—</span>;

  const date = new Date(relevantDate);
  const daysUntil = differenceInCalendarDays(date, new Date());
  const label = formatDateCL(relevantDate);

  if (isPast(date) && daysUntil < 0) {
    return (
      <Badge variant="destructive" className="font-normal">
        {label} · vencida
      </Badge>
    );
  }
  if (daysUntil <= 7) {
    return (
      <Badge variant="secondary" className="font-normal">
        {label} · en {daysUntil}d
      </Badge>
    );
  }
  return <span>{label}</span>;
}
