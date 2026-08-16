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

  const query = supabase
    .from("vaccines")
    .select(
      "id, vaccine_name, next_dose_date, pets(id, name, owner_id, owners(first_name, last_name, region_id, regions(name)))",
    )
    .not("next_dose_date", "is", null)
    .lte("next_dose_date", limitDate.toISOString().slice(0, 10))
    .is("deleted_at", null)
    .order("next_dose_date", { ascending: true })
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
      "id, product, next_dose_date, pets(id, name, owner_id, owners(first_name, last_name, region_id, regions(name)))",
    )
    .not("next_dose_date", "is", null)
    .lte("next_dose_date", limitDate.toISOString().slice(0, 10))
    .is("deleted_at", null)
    .order("next_dose_date", { ascending: true })
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
