"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";

export interface CalendarEventRow {
  event_date: string;
  event_type: string;
  title: string;
  pet_id: string | null;
  source_module: string;
  source_id: string;
  pet_name: string | null;
}

/**
 * `calendar_events` is a view over vaccines/dewormings/clinical_notes/
 * prescriptions/medications/lab_exams/imaging_exams (see
 * docs/migrations-propuestas.md Propuesta 6) — it now runs with
 * security_invoker=true, so this naturally only returns rows the caller's
 * own RLS (owner or panel permission) allows, same as querying each table
 * directly.
 */
export async function listCalendarEvents(
  fromIso: string,
  toIso: string,
): Promise<CalendarEventRow[]> {
  await requirePermission("dashboard:read");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("event_date", fromIso)
    .lt("event_date", toIso)
    .order("event_date", { ascending: true });

  if (error) {
    console.error("listCalendarEvents failed", error);
    return [];
  }

  // The view's columns are nullable in the generated types (no NOT NULL
  // tracked on views) but every branch of its UNION ALL always populates
  // them — this guard is just to satisfy the type and skip anything malformed.
  const rows = (data ?? []).filter(
    (
      r,
    ): r is typeof r & {
      event_date: string;
      event_type: string;
      title: string;
      source_module: string;
      source_id: string;
    } =>
      !!r.event_date &&
      !!r.event_type &&
      !!r.title &&
      !!r.source_module &&
      !!r.source_id,
  );

  const petIds = [
    ...new Set(rows.map((r) => r.pet_id).filter((id): id is string => !!id)),
  ];

  let petNames = new Map<string, string>();
  if (petIds.length) {
    const { data: pets } = await supabase
      .from("pets")
      .select("id, name")
      .in("id", petIds);
    petNames = new Map((pets ?? []).map((p) => [p.id, p.name]));
  }

  return rows.map((r) => ({
    ...r,
    pet_name: r.pet_id ? (petNames.get(r.pet_id) ?? null) : null,
  }));
}
