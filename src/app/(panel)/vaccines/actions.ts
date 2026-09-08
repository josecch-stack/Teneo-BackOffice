"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit/log";
import { vaccineFormSchema } from "@/lib/validations/vaccine";
import {
  calculateNextVaccineDose,
  type Species,
  type VaccineApplicationType,
} from "@/lib/utils/vaccine-dose";

const PAGE_SIZE = 20;

export interface ListVaccinesParams {
  q?: string;
  page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

const SORTABLE_COLUMNS = new Set([
  "vaccine_name",
  "application_date",
  "next_dose_date",
  "created_at",
]);

export async function listVaccines(params: ListVaccinesParams) {
  await requirePermission("vaccine:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const sort = SORTABLE_COLUMNS.has(params.sort ?? "")
    ? params.sort!
    : "application_date";
  const dir = params.dir === "asc";

  let query = supabase
    .from("vaccines")
    .select(
      "id, vaccine_name, application_type, application_date, next_dose_date, status, brand_lab, vet_center, pets(id, name, species, owners(first_name, last_name))",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (params.q) {
    query = query.ilike("vaccine_name", `%${params.q.trim()}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query
    .order(sort, { ascending: dir })
    .range(from, to);

  if (error) {
    console.error("listVaccines failed", error);
    return { rows: [], rowCount: 0, pageCount: 0, page };
  }

  const rowCount = count ?? 0;
  return {
    rows: data ?? [],
    rowCount,
    pageCount: Math.max(Math.ceil(rowCount / PAGE_SIZE), 1),
    page,
  };
}

export async function getVaccine(id: string) {
  await requirePermission("vaccine:read");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vaccines")
    .select(
      "*, pets(id, name, species, chip_number, owners(first_name, last_name))",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function listVaccineCatalog(species?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("vaccine_catalog")
    .select("id, name, species")
    .order("name");
  if (species) {
    query = query.or(`species.eq.${species},species.is.null`);
  }
  const { data } = await query;
  return data ?? [];
}

export async function listLabCatalog() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lab_catalog")
    .select("id, name")
    .order("name");
  return data ?? [];
}

export interface VaccineFormState {
  error?: string;
  success?: boolean;
}

function parseVaccineFormData(formData: FormData) {
  const str = (key: string) => formData.get(key) || undefined;
  return vaccineFormSchema.safeParse({
    pet_id: str("pet_id"),
    application_type: str("application_type"),
    vaccine_catalog_id: str("vaccine_catalog_id"),
    vaccine_name: str("vaccine_name"),
    application_date: str("application_date"),
    next_dose_date: str("next_dose_date"),
    lab_catalog_id: str("lab_catalog_id"),
    brand_lab: str("brand_lab"),
    batch_code: str("batch_code"),
    vet_center: str("vet_center"),
    vet_name: str("vet_name"),
  });
}

/**
 * The DB trigger that's supposed to do this (`trg_vaccines_calc_next_dose`)
 * is currently DISABLED in production (confirmed via pg_trigger.tgenabled =
 * 'D', 2026-08-13 — the other two vaccines triggers are enabled). Computing
 * it here means the panel works correctly regardless of the trigger's state;
 * if it's ever re-enabled this becomes a harmless redundant computation
 * (same inputs, same pure function). See docs/gaps.md.
 */
async function resolveNextDoseDate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  petId: string,
  applicationType: string,
  applicationDate: string,
  manualNextDoseDate: string | undefined,
): Promise<string | null> {
  const { data: pet } = await supabase
    .from("pets")
    .select("species")
    .eq("id", petId)
    .single();
  const species = pet?.species as Species | undefined;

  if (species === "perro" || species === "gato") {
    const computed = calculateNextVaccineDose(
      species,
      applicationType as VaccineApplicationType,
      new Date(applicationDate),
    );
    return computed ? computed.toISOString().slice(0, 10) : null;
  }

  return manualNextDoseDate ?? null;
}

export async function createVaccine(
  _prevState: VaccineFormState,
  formData: FormData,
): Promise<VaccineFormState> {
  await requirePermission("vaccine:write");
  const parsed = parseVaccineFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const v = parsed.data;
  const nextDoseDate = await resolveNextDoseDate(
    supabase,
    v.pet_id,
    v.application_type,
    v.application_date,
    v.next_dose_date,
  );

  const { data: created, error } = await supabase
    .from("vaccines")
    .insert({
      pet_id: v.pet_id,
      application_type: v.application_type,
      vaccine_catalog_id: v.vaccine_catalog_id ?? null,
      vaccine_name: v.vaccine_name ?? "",
      application_date: v.application_date,
      next_dose_date: nextDoseDate,
      lab_catalog_id: v.lab_catalog_id ?? null,
      brand_lab: v.brand_lab || null,
      batch_code: v.batch_code || null,
      vet_center: v.vet_center || null,
      vet_name: v.vet_name || null,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "No se pudo crear la vacuna. Intenta de nuevo." };
  }

  await writeAuditLog({
    action: "create",
    resource: "vaccine",
    recordId: created.id,
    newValues: v,
  });

  revalidatePath("/vaccines");
  redirect(`/vaccines/${created.id}`);
}

export async function updateVaccine(
  id: string,
  _prevState: VaccineFormState,
  formData: FormData,
): Promise<VaccineFormState> {
  await requirePermission("vaccine:write");
  const parsed = parseVaccineFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("vaccines")
    .select("*")
    .eq("id", id)
    .single();

  const v = parsed.data;
  const nextDoseDate = await resolveNextDoseDate(
    supabase,
    v.pet_id,
    v.application_type,
    v.application_date,
    v.next_dose_date,
  );

  const { error } = await supabase
    .from("vaccines")
    .update({
      pet_id: v.pet_id,
      application_type: v.application_type,
      vaccine_catalog_id: v.vaccine_catalog_id ?? null,
      vaccine_name: v.vaccine_name ?? "",
      application_date: v.application_date,
      next_dose_date: nextDoseDate,
      lab_catalog_id: v.lab_catalog_id ?? null,
      brand_lab: v.brand_lab || null,
      batch_code: v.batch_code || null,
      vet_center: v.vet_center || null,
      vet_name: v.vet_name || null,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  await writeAuditLog({
    action: "update",
    resource: "vaccine",
    recordId: id,
    oldValues: before,
    newValues: v,
  });

  revalidatePath("/vaccines");
  revalidatePath(`/vaccines/${id}`);
  return { success: true };
}
