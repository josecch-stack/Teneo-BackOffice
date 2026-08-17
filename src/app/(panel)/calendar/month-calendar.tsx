"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, isSameDay, isSameMonth, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { getMonthGridDays } from "@/lib/utils/calendar-grid";
import {
  CALENDAR_EVENT_TYPES,
  CALENDAR_EVENT_TYPE_COLORS,
  CALENDAR_EVENT_TYPE_LABELS,
  calendarEventHref,
  type CalendarEventType,
} from "@/lib/utils/calendar-event-types";
import type { CalendarEventRow } from "./actions";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_DOTS = 3;

export function MonthCalendar({
  monthDate,
  events,
}: {
  monthDate: Date;
  events: CalendarEventRow[];
}) {
  const [activeTypes, setActiveTypes] = useState<Set<CalendarEventType>>(
    new Set(CALENDAR_EVENT_TYPES),
  );
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(
    isSameMonth(today, monthDate) ? today : monthDate,
  );

  const days = useMemo(() => getMonthGridDays(monthDate), [monthDate]);

  const visibleEvents = useMemo(
    () =>
      events.filter((e) => activeTypes.has(e.event_type as CalendarEventType)),
    [events, activeTypes],
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventRow[]>();
    for (const event of visibleEvents) {
      const key = event.event_date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [visibleEvents]);

  function toggleType(type: CalendarEventType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const selectedEvents = eventsByDay.get(selectedKey) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {CALENDAR_EVENT_TYPES.map((type) => {
          const active = activeTypes.has(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-border bg-card text-foreground"
                  : "bg-muted text-muted-foreground/50 border-transparent",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  CALENDAR_EVENT_TYPE_COLORS[type],
                )}
              />
              {CALENDAR_EVENT_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <div className="border-border min-w-[640px] overflow-hidden rounded-md border">
          <div className="border-border bg-muted/50 text-muted-foreground grid grid-cols-7 border-b text-xs font-bold uppercase">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="px-2 py-2 text-center">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDay.get(key) ?? [];
              const inMonth = isSameMonth(day, monthDate);
              const selected = isSameDay(day, selectedDate);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "border-border hover:bg-accent flex min-h-20 flex-col items-start gap-1 border-r border-b p-2 text-left transition-colors last:border-r-0",
                    !inMonth && "bg-muted/30 text-muted-foreground/50",
                    selected && "bg-primary/10",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs",
                      isToday(day) &&
                        "bg-primary text-primary-foreground font-bold",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dayEvents.slice(0, MAX_DOTS).map((event, i) => (
                      <span
                        key={i}
                        className={cn(
                          "size-1.5 rounded-full",
                          CALENDAR_EVENT_TYPE_COLORS[
                            event.event_type as CalendarEventType
                          ],
                        )}
                      />
                    ))}
                    {dayEvents.length > MAX_DOTS && (
                      <span className="text-muted-foreground text-[10px]">
                        +{dayEvents.length - MAX_DOTS}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-border flex flex-col gap-2 rounded-md border p-4">
        <h2 className="text-foreground text-sm font-bold">
          {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
        </h2>
        {selectedEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">Sin eventos este día.</p>
        ) : (
          <ul className="divide-border flex flex-col divide-y">
            {selectedEvents.map((event, i) => {
              const href = calendarEventHref(
                event.source_module,
                event.source_id,
              );
              const content = (
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      CALENDAR_EVENT_TYPE_COLORS[
                        event.event_type as CalendarEventType
                      ],
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm",
                      href && "font-medium hover:underline",
                    )}
                  >
                    {event.title}
                  </span>
                  {event.pet_name && (
                    <span className="text-muted-foreground text-sm">
                      · {event.pet_name}
                    </span>
                  )}
                </span>
              );

              return (
                <li key={i} className="py-2">
                  {href ? <Link href={href}>{content}</Link> : content}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
