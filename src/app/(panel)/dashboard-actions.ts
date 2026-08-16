"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";
import { SPECIES_OPTIONS } from "@/lib/validations/pet";

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export async function getDashboardStats() {
  await requirePermission("dashboard:read");
  const supabase = await createClient();
  const monthStart = startOfMonth();

  const [
    ownersTotal,
    petsTotal,
    ownersNew,
    petsNew,
    petSharesTotal,
    speciesCounts,
  ] = await Promise.all([
    supabase
      .from("owners")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("owners")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", monthStart),
    supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", monthStart),
    supabase.from("pet_shares").select("*", { count: "exact", head: true }),
    Promise.all(
      SPECIES_OPTIONS.map(async (option) => {
        const { count } = await supabase
          .from("pets")
          .select("*", { count: "exact", head: true })
          .is("deleted_at", null)
          .eq("species", option.value);
        return { species: option.label, count: count ?? 0 };
      }),
    ),
  ]);

  return {
    ownersTotal: ownersTotal.count ?? 0,
    petsTotal: petsTotal.count ?? 0,
    ownersNewThisMonth: ownersNew.count ?? 0,
    petsNewThisMonth: petsNew.count ?? 0,
    petSharesTotal: petSharesTotal.count ?? 0,
    speciesDistribution: speciesCounts.filter((s) => s.count > 0),
  };
}
