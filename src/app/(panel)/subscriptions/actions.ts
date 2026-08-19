"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";

const PAGE_SIZE = 20;

export interface ListSubscriptionsParams {
  q?: string;
  page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

const SORTABLE_COLUMNS = new Set([
  "plan_name",
  "status",
  "start_date",
  "end_date",
  "created_at",
]);

export async function listSubscriptions(params: ListSubscriptionsParams) {
  await requirePermission("subscription:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const sort = SORTABLE_COLUMNS.has(params.sort ?? "")
    ? params.sort!
    : "created_at";
  const dir = params.dir === "asc";

  let query = supabase
    .from("subscriptions")
    .select(
      "id, plan_name, status, start_date, end_date, payment_method, owners(first_name, last_name, email)",
      {
        count: "exact",
      },
    );

  if (params.q) {
    const q = params.q.trim();
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`, {
      referencedTable: "owners",
    });
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query
    .order(sort, { ascending: dir })
    .range(from, to);

  if (error) {
    console.error("listSubscriptions failed", error);
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
