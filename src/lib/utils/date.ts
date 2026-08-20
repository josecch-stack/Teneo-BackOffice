const CL_TIMEZONE = "America/Santiago";

/**
 * date-fns' format(new Date(iso), "dd/MM/yyyy") reads the *system* timezone
 * of whatever machine runs it — the server (Railway, UTC) and a visitor's
 * browser (Chile) disagree, so a "use client" column that formats a
 * server-provided timestamp hydration-mismatches for every real visitor
 * (never reproduces locally, since there server and client share one
 * timezone by definition). Fixed by pinning the timezone explicitly so the
 * server-rendered and client-hydrated output are always identical.
 */
function partsCL(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/** Postgres `date` columns (birth_date, application_date, event_date...)
 * come back as a bare "YYYY-MM-DD" — not a moment in time at all, so
 * running it through *any* timezone conversion can shift the calendar day
 * (midnight UTC is already the previous evening in Chile). Read the digits
 * directly instead of going through Date/Intl for these. */
function isDateOnly(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso);
}

export function formatDateCL(iso: string): string {
  if (isDateOnly(iso)) {
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
  }
  const p = partsCL(iso);
  return `${p.day}/${p.month}/${p.year}`;
}

export function formatDateTimeCL(iso: string): string {
  const p = partsCL(iso);
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

/**
 * "Today" in Chile as "YYYY-MM-DD" — meant to be computed once, server-side
 * (e.g. in a page.tsx Server Component), and passed down as a prop to any
 * "use client" component that needs to know which calendar day is "today".
 * `new Date()` read via local getters inside a client component gives a
 * different day depending on whether it's evaluated during SSR (Railway,
 * UTC) or hydration (the visitor's browser, Chile) — this sidesteps that by
 * only ever computing "today" once, in one place.
 */
export function getTodayCL(): string {
  const p = partsCL(new Date().toISOString());
  return `${p.year}-${p.month}-${p.day}`;
}
