import { format, isPast, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export function NextDoseBadge({
  nextDoseDate,
}: {
  nextDoseDate: string | null;
}) {
  if (!nextDoseDate) return <span className="text-muted-foreground">—</span>;
  const date = new Date(nextDoseDate);
  const daysUntil = differenceInCalendarDays(date, new Date());
  const label = format(date, "dd/MM/yyyy", { locale: es });

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
