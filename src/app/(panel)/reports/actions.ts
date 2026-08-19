"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";
import type { Database } from "@/types/database.types";

const PAGE_SIZE = 20;
const EXPORT_CAP = 5000;

export interface OwnersReportFilters {
  from?: string;
  to?: string;
  regionId?: number;
  subscriptionStatus?: string;
  plan?: string;
}

export interface PetsReportFilters {
  from?: string;
  to?: string;
  regionId?: number;
  species?: string;
}

const OWNERS_REPORT_SELECT =
  "user_id, first_name, last_name, rut, phone, email, address, created_at, regions(name), communes(name), pets(count)";

function buildOwnersReportQuery(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: OwnersReportFilters,
) {
  const embed =
    filters.subscriptionStatus || filters.plan
      ? "subscriptions!inner(status, plan_name)"
      : "subscriptions(status, plan_name)";
  let query = supabase
    .from("owners")
    .select(`${OWNERS_REPORT_SELECT}, ${embed}`, { count: "exact" })
    .is("deleted_at", null);

  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);
  if (filters.regionId) query = query.eq("region_id", filters.regionId);
  if (filters.subscriptionStatus) {
    query = query.eq(
      "subscriptions.status",
      filters.subscriptionStatus as Database["public"]["Enums"]["subscription_status"],
    );
  }
  if (filters.plan) query = query.eq("subscriptions.plan_name", filters.plan);

  return query;
}

export async function listOwnersReport(
  filters: OwnersReportFilters & { page?: number },
) {
  await requirePermission("export:bulk");
  const supabase = await createClient();

  const page = Math.max(filters.page ?? 1, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await buildOwnersReportQuery(supabase, filters)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("listOwnersReport failed", error);
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

export async function listOwnersReportAll(filters: OwnersReportFilters) {
  await requirePermission("export:bulk");
  const supabase = await createClient();

  const { data, error } = await buildOwnersReportQuery(supabase, filters)
    .order("created_at", { ascending: false })
    .limit(EXPORT_CAP);

  if (error) {
    console.error("listOwnersReportAll failed", error);
    return [];
  }
  return data ?? [];
}

const PETS_REPORT_SELECT =
  "id, name, species, breed, sex, birth_date, is_sterilized, chip_number, created_at";

function buildPetsReportQuery(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: PetsReportFilters,
) {
  const ownersEmbed = filters.regionId
    ? "owners!inner(first_name, last_name, region_id, regions(name))"
    : "owners(first_name, last_name, region_id, regions(name))";
  let query = supabase
    .from("pets")
    .select(`${PETS_REPORT_SELECT}, ${ownersEmbed}`, { count: "exact" })
    .is("deleted_at", null);

  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);
  if (filters.species) {
    // Comma-separated so "Otros" (Pets page tab) can group several species
    // values under one filter without a dedicated param.
    const values = filters.species.split(
      ",",
    ) as Database["public"]["Enums"]["species_type"][];
    query =
      values.length > 1
        ? query.in("species", values)
        : query.eq("species", values[0]!);
  }
  if (filters.regionId) query = query.eq("owners.region_id", filters.regionId);

  return query;
}

export async function listPetsReport(
  filters: PetsReportFilters & { page?: number },
) {
  await requirePermission("export:bulk");
  const supabase = await createClient();

  const page = Math.max(filters.page ?? 1, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await buildPetsReportQuery(supabase, filters)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("listPetsReport failed", error);
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

export async function listPetsReportAll(filters: PetsReportFilters) {
  await requirePermission("export:bulk");
  const supabase = await createClient();

  const { data, error } = await buildPetsReportQuery(supabase, filters)
    .order("created_at", { ascending: false })
    .limit(EXPORT_CAP);

  if (error) {
    console.error("listPetsReportAll failed", error);
    return [];
  }
  return data ?? [];
}
