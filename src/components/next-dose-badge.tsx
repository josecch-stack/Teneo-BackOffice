import { isPast, differenceInCalendarDays } from "date-fns";
import { formatDateCL } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";

export function NextDoseBadge({
  nextDoseDate,
}: {
  nextDoseDate: string | null;
}) {
  if (!nextDoseDate) return <span className="text-muted-foreground">—</span>;
  const date = new Date(nextDoseDate);
  const daysUntil = differenceInCalendarDays(date, new Date());
  const label = formatDateCL(nextDoseDate);

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
