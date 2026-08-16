"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit/log";
import { petFormSchema } from "@/lib/validations/pet";
import { cascadeDeletePetClinicalRecords } from "@/lib/supabase/cascade-delete";

const PAGE_SIZE = 20;

export interface ListPetsParams {
  q?: string;
  page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

const SORTABLE_COLUMNS = new Set(["name", "created_at", "birth_date"]);

export async function listPets(params: ListPetsParams) {
  await requirePermission("pet:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const sort = SORTABLE_COLUMNS.has(params.sort ?? "")
    ? params.sort!
    : "created_at";
  const dir = params.dir === "asc";

  let query = supabase
    .from("pets")
    .select(
      "id, name, species, custom_species, breed, birth_date, chip_number, profile_photo_url, created_at, owners(user_id, first_name, last_name)",
      {
        count: "exact",
      },
    )
    .is("deleted_at", null);

  if (params.q) {
    const q = params.q.trim();
    query = query.or(`name.ilike.%${q}%,chip_number.ilike.%${q}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query
    .order(sort, { ascending: dir })
    .range(from, to);

  if (error) {
    console.error("listPets failed", error);
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

export async function getPet(id: string) {
  await requirePermission("pet:read");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pets")
    .select("*, owners(user_id, first_name, last_name, rut, email)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function searchPets(q: string) {
  await requirePermission("pet:read");
  if (!q || q.trim().length < 2) return [];
  const supabase = await createClient();

  const { data } = await supabase
    .from("pets")
    .select("id, name, species, chip_number, owners(first_name, last_name)")
    .or(`name.ilike.%${q}%,chip_number.ilike.%${q}%`)
    .is("deleted_at", null)
    .limit(10);

  return data ?? [];
}

export async function searchOwners(q: string) {
  await requirePermission("pet:write");
  if (!q || q.trim().length < 2) return [];
  const supabase = await createClient();

  const { data } = await supabase
    .from("owners")
    .select("user_id, first_name, last_name, rut, email")
    .or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,rut.ilike.%${q}%,email.ilike.%${q}%`,
    )
    .is("deleted_at", null)
    .limit(10);

  return data ?? [];
}

export interface PetFormState {
  error?: string;
  success?: boolean;
}

function parsePetFormData(formData: FormData) {
  // FormData.get() returns null for a field absent from the DOM (e.g.
  // custom_species, only rendered when species === "otro") — normalize to
  // undefined so it doesn't fail validation the way a missing key would.
  const str = (key: string) => formData.get(key) || undefined;

  return petFormSchema.safeParse({
    owner_id: str("owner_id"),
    name: str("name"),
    species: str("species"),
    custom_species: str("custom_species"),
    breed: str("breed"),
    birth_date: str("birth_date"),
    sex: str("sex"),
    color: str("color"),
    weight_kg: str("weight_kg"),
    is_sterilized: formData.get("is_sterilized") === "on",
    health_notes: str("health_notes"),
    chip_number: str("chip_number"),
    vet_name: str("vet_name"),
    vet_phone: str("vet_phone"),
  });
}

export async function createPet(
  _prevState: PetFormState,
  formData: FormData,
): Promise<PetFormState> {
  await requirePermission("pet:write");
  const parsed = parsePetFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const v = parsed.data;
  const { data: created, error } = await supabase
    .from("pets")
    .insert({
      owner_id: v.owner_id,
      name: v.name,
      species: v.species,
      custom_species: v.custom_species || null,
      breed: v.breed || null,
      birth_date: v.birth_date,
      sex: v.sex ?? null,
      color: v.color || null,
      weight_kg: v.weight_kg ?? null,
      is_sterilized: v.is_sterilized,
      health_notes: v.health_notes || null,
      chip_number: v.chip_number || null,
      vet_name: v.vet_name || null,
      vet_phone: v.vet_phone || null,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "No se pudo crear la mascota. Intenta de nuevo." };
  }

  await writeAuditLog({
    action: "create",
    resource: "pet",
    recordId: created.id,
    newValues: v,
  });

  revalidatePath("/pets");
  redirect(`/pets/${created.id}`);
}

export async function updatePet(
  id: string,
  _prevState: PetFormState,
  formData: FormData,
): Promise<PetFormState> {
  await requirePermission("pet:write");
  const parsed = parsePetFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .single();

  const v = parsed.data;
  const { error } = await supabase
    .from("pets")
    .update({
      owner_id: v.owner_id,
      name: v.name,
      species: v.species,
      custom_species: v.custom_species || null,
      breed: v.breed || null,
      birth_date: v.birth_date,
      sex: v.sex ?? null,
      color: v.color || null,
      weight_kg: v.weight_kg ?? null,
      is_sterilized: v.is_sterilized,
      health_notes: v.health_notes || null,
      chip_number: v.chip_number || null,
      vet_name: v.vet_name || null,
      vet_phone: v.vet_phone || null,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  await writeAuditLog({
    action: "update",
    resource: "pet",
    recordId: id,
    oldValues: before,
    newValues: v,
  });

  revalidatePath("/pets");
  revalidatePath(`/pets/${id}`);
  return { success: true };
}

export async function deletePet(id: string) {
  await requirePermission("pet:write");
  const supabase = await createClient();

  const { data: before } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .single();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("pets")
    .update({ deleted_at: now })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    throw new Error("No se pudo eliminar la mascota.");
  }

  await cascadeDeletePetClinicalRecords(id, now);

  await writeAuditLog({
    action: "delete",
    resource: "pet",
    recordId: id,
    oldValues: before,
  });

  revalidatePath("/pets");
}
