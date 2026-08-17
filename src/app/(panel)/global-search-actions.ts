"use server";

import { createClient } from "@/lib/supabase/server";
import { verifySession, hasPermission } from "@/lib/auth/dal";

const RESULT_LIMIT = 5;

export interface GlobalSearchOwner {
  type: "owner";
  id: string;
  title: string;
  subtitle: string | null;
}

export interface GlobalSearchPet {
  type: "pet";
  id: string;
  title: string;
  subtitle: string | null;
}

export type GlobalSearchResult = GlobalSearchOwner | GlobalSearchPet;

export async function globalSearch(
  rawQuery: string,
): Promise<GlobalSearchResult[]> {
  const q = rawQuery.trim();
  if (q.length < 2) return [];

  const session = await verifySession();
  const supabase = await createClient();
  const results: GlobalSearchResult[] = [];

  if (hasPermission(session, "owner:read")) {
    const { data: owners } = await supabase
      .from("owners")
      .select("user_id, first_name, last_name, email")
      .is("deleted_at", null)
      .or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,rut.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`,
      )
      .limit(RESULT_LIMIT);

    for (const o of owners ?? []) {
      results.push({
        type: "owner",
        id: o.user_id,
        title: `${o.first_name} ${o.last_name ?? ""}`.trim(),
        subtitle: o.email,
      });
    }
  }

  if (hasPermission(session, "pet:read")) {
    const { data: pets } = await supabase
      .from("pets")
      .select("id, name, chip_number, owners(first_name, last_name)")
      .is("deleted_at", null)
      .or(`name.ilike.%${q}%,chip_number.ilike.%${q}%`)
      .limit(RESULT_LIMIT);

    for (const p of pets ?? []) {
      const ownerName = p.owners
        ? `${p.owners.first_name} ${p.owners.last_name ?? ""}`.trim()
        : null;
      results.push({
        type: "pet",
        id: p.id,
        title: p.name,
        subtitle: ownerName,
      });
    }
  }

  return results;
}
