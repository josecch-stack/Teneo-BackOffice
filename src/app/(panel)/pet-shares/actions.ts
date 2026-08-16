"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";

const PAGE_SIZE = 20;

export interface ListPetSharesParams {
  q?: string;
  page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

const SORTABLE_COLUMNS = new Set(["created_at", "accepted"]);

export async function listPetShares(params: ListPetSharesParams) {
  await requirePermission("pet_share:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const sort = SORTABLE_COLUMNS.has(params.sort ?? "")
    ? params.sort!
    : "created_at";
  const dir = params.dir === "asc";

  let query = supabase
    .from("pet_shares")
    .select(
      "id, shared_with_email, accepted, created_at, pets(id, name), sharer:shared_by(first_name, last_name)",
      { count: "exact" },
    );

  if (params.q) {
    query = query.ilike("shared_with_email", `%${params.q.trim()}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query
    .order(sort, { ascending: dir })
    .range(from, to);

  if (error) {
    console.error("listPetShares failed", error);
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
