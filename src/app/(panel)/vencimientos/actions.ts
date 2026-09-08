"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";

export interface VencimientosParams {
  regionId?: number;
  withinDays?: number;
}

export async function getExpiringVaccines({
  regionId,
  withinDays = 30,
}: VencimientosParams) {
  await requirePermission("vaccine:read");
  const supabase = await createClient();

  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + withinDays);

  // "Vencido o por vencer" ahora vive en las filas con status='pending' — su
  // propia application_date ES la fecha comprometida (next_dose_date se deja
  // null hasta que se aplique de verdad). Antes esto se inferí­a del
  // next_dose_date de la última dosis aplicada; ese campo sigue existiendo
  // mas es informativo, no la fuente de verdad de qué está pendiente.
  const query = supabase
    .from("vaccines")
    .select(
      "id, vaccine_name, application_date, pets(id, name, owner_id, owners(first_name, last_name, region_id, regions(name)))",
    )
    .eq("status", "pending")
    .lte("application_date", limitDate.toISOString().slice(0, 10))
    .is("deleted_at", null)
    .order("application_date", { ascending: true })
    .limit(100);

  const { data, error } = await query;
  if (error) {
    console.error("getExpiringVaccines failed", error);
    return [];
  }

  const rows = data ?? [];
  if (!regionId) return rows;
  return rows.filter((r) => r.pets?.owners?.region_id === regionId);
}

export async function getExpiringDewormings({
  regionId,
  withinDays = 30,
}: VencimientosParams) {
  await requirePermission("deworming:read");
  const supabase = await createClient();

  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + withinDays);

  const query = supabase
    .from("dewormings")
    .select(
      "id, product, application_date, pets(id, name, owner_id, owners(first_name, last_name, region_id, regions(name)))",
    )
    .eq("status", "pending")
    .lte("application_date", limitDate.toISOString().slice(0, 10))
    .is("deleted_at", null)
    .order("application_date", { ascending: true })
    .limit(100);

  const { data, error } = await query;
  if (error) {
    console.error("getExpiringDewormings failed", error);
    return [];
  }

  const rows = data ?? [];
  if (!regionId) return rows;
  return rows.filter((r) => r.pets?.owners?.region_id === regionId);
}
