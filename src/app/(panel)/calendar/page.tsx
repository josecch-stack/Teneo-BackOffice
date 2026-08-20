import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths } from "date-fns";
import { listCalendarEvents } from "./actions";
import { MonthCalendar } from "./month-calendar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTodayCL } from "@/lib/utils/date";

// month is a UTC-anchored Date (see parseMonthParam) — read/shift it via
// UTC components, not date-fns' local-timezone helpers, so this page shows
// the right month regardless of which timezone the machine running it is
// actually in.
function monthParamFor(monthDate: Date, offset: number): string {
  const d = new Date(
    Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + offset, 1),
  );
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(monthDate: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(monthDate);
}

// UTC-anchored on purpose (see month-calendar.tsx / calendar-grid.ts) — a
// month is a calendar concept, not a moment in time, so it's built and read
// via UTC components everywhere rather than the machine's local timezone.
function parseMonthParam(value: string | undefined, todayISO: string): Date {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, 1));
  }
  const [year, month] = todayISO.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

export default async function CalendarPage(props: PageProps<"/calendar">) {
  const searchParams = await props.searchParams;
  const monthParam =
    typeof searchParams.month === "string" ? searchParams.month : undefined;
  const todayISO = getTodayCL();
  const monthDate = parseMonthParam(monthParam, todayISO);

  const from = monthDate;
  const to = addMonths(monthDate, 1);
  const events = await listCalendarEvents(from.toISOString(), to.toISOString());

  const prevMonth = monthParamFor(monthDate, -1);
  const nextMonth = monthParamFor(monthDate, 1);

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
            {monthLabel(monthDate)}
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

      <MonthCalendar
        monthDate={monthDate}
        events={events}
        todayISO={todayISO}
      />
    </div>
  );
}
