"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";

export async function listVaccineCatalogFull() {
  await requirePermission("catalog:manage");
  const supabase = await createClient();
  const { data } = await supabase
    .from("vaccine_catalog")
    .select("id, name, species, description")
    .order("name");
  return data ?? [];
}

export async function listLabCatalogFull() {
  await requirePermission("catalog:manage");
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_catalog")
    .select("id, name")
    .order("name");
  return data ?? [];
}

export async function listRegionsFull() {
  await requirePermission("catalog:manage");
  const supabase = await createClient();
  const { data } = await supabase
    .from("regions")
    .select("id, name, code, ordinal")
    .order("ordinal");
  return data ?? [];
}

export async function listCommunesFull() {
  await requirePermission("catalog:manage");
  const supabase = await createClient();
  const { data } = await supabase
    .from("communes")
    .select("id, name, regions(name)")
    .order("name");
  return data ?? [];
}
