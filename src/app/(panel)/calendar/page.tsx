import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { listCalendarEvents } from "./actions";
import { MonthCalendar } from "./month-calendar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function parseMonthParam(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }
  return startOfMonth(new Date());
}

export default async function CalendarPage(props: PageProps<"/calendar">) {
  const searchParams = await props.searchParams;
  const monthParam =
    typeof searchParams.month === "string" ? searchParams.month : undefined;
  const monthDate = parseMonthParam(monthParam);

  const from = monthDate;
  const to = addMonths(monthDate, 1);
  const events = await listCalendarEvents(from.toISOString(), to.toISOString());

  const prevMonth = format(addMonths(monthDate, -1), "yyyy-MM");
  const nextMonth = format(addMonths(monthDate, 1), "yyyy-MM");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Calendario</h1>
          <p className="text-muted-foreground text-sm">
            Vacunas, desparasitaciones, consultas, exámenes y controles en un
            solo lugar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?month=${prevMonth}`}
            aria-label="Mes anterior"
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          >
            <ChevronLeft className="size-4" />
          </Link>
          <span className="w-40 text-center text-sm font-bold capitalize">
            {format(monthDate, "MMMM yyyy", { locale: es })}
          </span>
          <Link
            href={`/calendar?month=${nextMonth}`}
            aria-label="Mes siguiente"
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <MonthCalendar monthDate={monthDate} events={events} />
    </div>
  );
}
