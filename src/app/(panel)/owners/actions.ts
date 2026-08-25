"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit/log";
import { ownerFormSchema } from "@/lib/validations/owner";
import { cascadeDeletePetClinicalRecords } from "@/lib/supabase/cascade-delete";

const PAGE_SIZE = 20;

export interface ListOwnersParams {
  q?: string;
  page?: number;
  sort?: string;
  dir?: "asc" | "desc";
  from?: string;
  to?: string;
  /** "all" (default) | "free" (sin suscripción activa) | "premium" (activa) */
  plan?: string;
}

const SORTABLE_COLUMNS = new Set(["first_name", "created_at"]);

export async function listOwners(params: ListOwnersParams) {
  await requirePermission("owner:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const sort = SORTABLE_COLUMNS.has(params.sort ?? "")
    ? params.sort!
    : "created_at";
  const dir = params.dir === "asc";
  const isPremiumFilter = params.plan === "premium";
  const isFreeFilter = params.plan === "free";

  const subscriptionsEmbed = isPremiumFilter
    ? "subscriptions!inner(plan_name, status, price, billing_cycle, payment_method)"
    : "subscriptions(plan_name, status, price, billing_cycle, payment_method)";

  let query = supabase
    .from("owners")
    .select(
      `user_id, first_name, last_name, rut, phone, email, created_at, regions(name), communes(name), pet_shares!shared_by(count), ${subscriptionsEmbed}`,
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (params.q) {
    const q = params.q.trim();
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,rut.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`,
    );
  }
  if (params.from) query = query.gte("created_at", params.from);
  if (params.to) query = query.lte("created_at", params.to);
  if (isPremiumFilter) {
    query = query.eq("subscriptions.status", "active");
  } else if (isFreeFilter) {
    // No hay forma directa de filtrar "sin suscripción activa" vía el embed
    // (subscriptions.owner_id es único, y PostgREST no soporta un NOT EXISTS
    // por sintaxis de embed) — se resuelve con una consulta previa a los
    // owner_id activos y se excluyen acá.
    const { data: activeOwners } = await supabase
      .from("subscriptions")
      .select("owner_id")
      .eq("status", "active");
    const activeIds = (activeOwners ?? []).map((o) => o.owner_id);
    if (activeIds.length > 0) {
      query = query.not("user_id", "in", `(${activeIds.join(",")})`);
    }
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query
    .order(sort, { ascending: dir })
    .range(from, to);

  if (error) {
    console.error("listOwners failed", error);
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

export async function getOwner(userId: string) {
  await requirePermission("owner:read");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("owners")
    .select(
      "*, regions(id, name), communes(id, name), subscriptions(status, plan_name, payment_method)",
    )
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

/**
 * Otorga o revoca Premium manualmente desde el backoffice — para soporte,
 * cortesías, etc. No es un cobro real: queda registrado con
 * payment_method='manual' para distinguirlo de una suscripción pagada de
 * verdad (apple/google/card). Al revocar, la fila no se borra — queda
 * `cancelled` (mismo criterio que una cancelación real), preservando el
 * historial de que alguna vez tuvo Premium.
 */
export async function setOwnerPremium(userId: string, premium: boolean) {
  await requirePermission("subscription:write");
  const supabase = await createClient();

  const { data: before } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();

  if (premium) {
    const { error } = await supabase.from("subscriptions").upsert(
      {
        owner_id: userId,
        plan_name: "Premium",
        status: "active",
        payment_method: "manual",
        price: null,
        billing_cycle: null,
        start_date: new Date().toISOString(),
        end_date: null,
      },
      { onConflict: "owner_id" },
    );
    if (error) throw new Error("No se pudo activar Premium.");
  } else {
    if (!before) return; // no había suscripción, nada que revertir
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled", end_date: new Date().toISOString() })
      .eq("owner_id", userId);
    if (error) throw new Error("No se pudo revertir Premium.");
  }

  await writeAuditLog({
    action: "update",
    resource: "subscription",
    recordId: userId,
    oldValues: before,
    newValues: { premium },
  });

  revalidatePath("/owners");
  revalidatePath(`/owners/${userId}`);
}

export interface UpdateOwnerState {
  error?: string;
  success?: boolean;
}

export async function updateOwner(
  userId: string,
  _prevState: UpdateOwnerState,
  formData: FormData,
): Promise<UpdateOwnerState> {
  await requirePermission("owner:write");

  const parsed = ownerFormSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    rut: formData.get("rut"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    region_id: formData.get("region_id") || undefined,
    commune_id: formData.get("commune_id") || undefined,
    address: formData.get("address"),
    condo_building: formData.get("condo_building"),
    apt_house: formData.get("apt_house"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("owners")
    .select("*")
    .eq("user_id", userId)
    .single();

  const values = parsed.data;
  const { error } = await supabase
    .from("owners")
    .update({
      first_name: values.first_name,
      last_name: values.last_name || null,
      rut: values.rut || null,
      phone: values.phone || null,
      email: values.email || null,
      region_id: values.region_id ?? null,
      commune_id: values.commune_id ?? null,
      address: values.address || null,
      condo_building: values.condo_building || null,
      apt_house: values.apt_house || null,
    })
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  await writeAuditLog({
    action: "update",
    resource: "owner",
    recordId: userId,
    oldValues: before,
    newValues: values,
  });

  revalidatePath("/owners");
  revalidatePath(`/owners/${userId}`);
  return { success: true };
}

/**
 * Soft delete only — never a real DELETE (see docs/gaps.md G8). Deleting a
 * tutor's account cascades to their own pets (not shared-with pets) and each
 * pet's clinical history (Propuesta 9), same "deleting the account deletes
 * its data" expectation the App Store/Play Store review guidelines assume.
 */
export async function deleteOwner(userId: string) {
  await requirePermission("owner:write");
  const supabase = await createClient();

  const { data: before } = await supabase
    .from("owners")
    .select("*")
    .eq("user_id", userId)
    .single();

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("owners")
    .update({ deleted_at: now })
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) {
    throw new Error("No se pudo eliminar el tutor.");
  }

  const { data: cascadedPets } = await supabase
    .from("pets")
    .update({ deleted_at: now })
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .select("id");

  await Promise.all(
    (cascadedPets ?? []).map((p) => cascadeDeletePetClinicalRecords(p.id, now)),
  );

  await writeAuditLog({
    action: "delete",
    resource: "owner",
    recordId: userId,
    oldValues: before,
    newValues: { cascaded_pet_ids: (cascadedPets ?? []).map((p) => p.id) },
  });

  revalidatePath("/owners");
  revalidatePath("/pets");
}

export async function listRegions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("regions")
    .select("id, name")
    .order("ordinal");
  return data ?? [];
}

export async function listCommunes(regionId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("communes")
    .select("id, name")
    .eq("region_id", regionId)
    .order("name");
  return data ?? [];
}
