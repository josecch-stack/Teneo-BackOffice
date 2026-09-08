"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit/log";
import { dewormingFormSchema } from "@/lib/validations/deworming";

const PAGE_SIZE = 20;

export interface ListDewormingsParams {
  q?: string;
  page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

const SORTABLE_COLUMNS = new Set([
  "product",
  "application_date",
  "next_dose_date",
  "created_at",
]);

export async function listDewormings(params: ListDewormingsParams) {
  await requirePermission("deworming:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const sort = SORTABLE_COLUMNS.has(params.sort ?? "")
    ? params.sort!
    : "application_date";
  const dir = params.dir === "asc";

  let query = supabase
    .from("dewormings")
    .select(
      "id, type, product, application_date, next_dose_date, status, pets(id, name, owners(first_name, last_name))",
      {
        count: "exact",
      },
    )
    .is("deleted_at", null);

  if (params.q) {
    query = query.ilike("product", `%${params.q.trim()}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query
    .order(sort, { ascending: dir })
    .range(from, to);

  if (error) {
    console.error("listDewormings failed", error);
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

export async function getDeworming(id: string) {
  await requirePermission("deworming:read");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dewormings")
    .select(
      "*, pets(id, name, species, chip_number, owners(first_name, last_name))",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export interface DewormingFormState {
  error?: string;
  success?: boolean;
}

function parseDewormingFormData(formData: FormData) {
  const str = (key: string) => formData.get(key) || undefined;
  return dewormingFormSchema.safeParse({
    pet_id: str("pet_id"),
    type: str("type"),
    product: str("product"),
    application_date: str("application_date"),
    next_dose_date: str("next_dose_date"),
    weight_kg: str("weight_kg"),
    dosage: str("dosage"),
  });
}

export async function createDeworming(
  _prevState: DewormingFormState,
  formData: FormData,
): Promise<DewormingFormState> {
  await requirePermission("deworming:write");
  const parsed = parseDewormingFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const v = parsed.data;
  const { data: created, error } = await supabase
    .from("dewormings")
    .insert({
      pet_id: v.pet_id,
      type: v.type,
      product: v.product,
      application_date: v.application_date,
      next_dose_date: v.next_dose_date || null,
      weight_kg: v.weight_kg ?? null,
      dosage: v.dosage || null,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "No se pudo crear la desparasitación. Intenta de nuevo." };
  }

  await writeAuditLog({
    action: "create",
    resource: "deworming",
    recordId: created.id,
    newValues: v,
  });

  revalidatePath("/dewormings");
  redirect(`/dewormings/${created.id}`);
}

export async function updateDeworming(
  id: string,
  _prevState: DewormingFormState,
  formData: FormData,
): Promise<DewormingFormState> {
  await requirePermission("deworming:write");
  const parsed = parseDewormingFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("dewormings")
    .select("*")
    .eq("id", id)
    .single();

  const v = parsed.data;
  const { error } = await supabase
    .from("dewormings")
    .update({
      pet_id: v.pet_id,
      type: v.type,
      product: v.product,
      application_date: v.application_date,
      next_dose_date: v.next_dose_date || null,
      weight_kg: v.weight_kg ?? null,
      dosage: v.dosage || null,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  await writeAuditLog({
    action: "update",
    resource: "deworming",
    recordId: id,
    oldValues: before,
    newValues: v,
  });

  revalidatePath("/dewormings");
  revalidatePath(`/dewormings/${id}`);
  return { success: true };
}
