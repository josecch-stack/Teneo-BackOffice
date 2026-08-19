"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";
import { SPECIES_OPTIONS } from "@/lib/validations/pet";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/utils/notification";

const MONTHS_BACK = 6;

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function monthsAgo(n: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - n, 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("es-CL", { month: "short", year: "2-digit" });
}

/**
 * Buckets a list of ISO timestamps into the trailing MONTHS_BACK months,
 * zero-filled — a month with nothing in it still shows up as a real 0 bar
 * instead of silently disappearing from the axis.
 */
function bucketByMonth(isoDates: string[]): { month: string; count: number }[] {
  const buckets = new Map<string, { month: string; count: number }>();
  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const d = monthsAgo(i);
    buckets.set(monthKey(d), { month: monthLabel(d), count: 0 });
  }
  for (const iso of isoDates) {
    const bucket = buckets.get(monthKey(new Date(iso)));
    if (bucket) bucket.count++;
  }
  return [...buckets.values()];
}

export async function getDashboardStats() {
  await requirePermission("dashboard:read");
  const supabase = await createClient();
  const monthStart = startOfMonth();
  const trailingWindowStart = monthsAgo(MONTHS_BACK - 1).toISOString();

  const [
    ownersTotal,
    petsTotal,
    ownersNew,
    petsNew,
    petSharesTotal,
    speciesCounts,
    ownersMonthly,
    subscriptionsMonthly,
    notificationTypes,
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
    // RLS naturally scopes these two to nothing (empty array, not an error)
    // for a role without owner:read/subscription:read — same behavior the
    // pet_shares tile above already relies on.
    supabase
      .from("owners")
      .select("created_at")
      .is("deleted_at", null)
      .gte("created_at", trailingWindowStart),
    supabase
      .from("subscriptions")
      .select("created_at")
      .gte("created_at", trailingWindowStart),
    supabase.from("notifications").select("notification_type"),
  ]);

  const notificationCountByType = new Map<string, number>();
  for (const row of notificationTypes.data ?? []) {
    notificationCountByType.set(
      row.notification_type,
      (notificationCountByType.get(row.notification_type) ?? 0) + 1,
    );
  }

  return {
    ownersTotal: ownersTotal.count ?? 0,
    petsTotal: petsTotal.count ?? 0,
    ownersNewThisMonth: ownersNew.count ?? 0,
    petsNewThisMonth: petsNew.count ?? 0,
    petSharesTotal: petSharesTotal.count ?? 0,
    speciesDistribution: speciesCounts.filter((s) => s.count > 0),
    ownersByMonth: bucketByMonth(
      (ownersMonthly.data ?? []).map((r) => r.created_at),
    ),
    subscriptionsByMonth: bucketByMonth(
      (subscriptionsMonthly.data ?? []).map((r) => r.created_at),
    ),
    notificationsByType: Object.entries(NOTIFICATION_TYPE_LABELS)
      .map(([value, label]) => ({
        label,
        count: notificationCountByType.get(value) ?? 0,
      }))
      .filter((t) => t.count > 0),
  };
}

const RECENT_LIMIT = 5;

export interface RecentOwnerRow {
  user_id: string;
  name: string;
  email: string | null;
  petCount: number;
  planName: string | null;
  price: number | null;
  billingCycle: string | null;
  created_at: string;
}

export async function getRecentOwners(): Promise<RecentOwnerRow[]> {
  await requirePermission("dashboard:read");
  const supabase = await createClient();

  const { data } = await supabase
    .from("owners")
    .select(
      "user_id, first_name, last_name, email, created_at, pets(count), subscriptions(plan_name, status, price, billing_cycle)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .order("created_at", { ascending: false, foreignTable: "subscriptions" })
    .limit(RECENT_LIMIT);

  return (data ?? []).map((r) => {
    const activeSub = r.subscriptions?.find((s) => s.status === "active");
    return {
      user_id: r.user_id,
      name: `${r.first_name} ${r.last_name ?? ""}`.trim(),
      email: r.email,
      petCount: r.pets?.[0]?.count ?? 0,
      planName: activeSub?.plan_name ?? null,
      price: activeSub?.price ?? null,
      billingCycle: activeSub?.billing_cycle ?? null,
      created_at: r.created_at,
    };
  });
}

export interface RecentSubscriptionRow {
  id: string;
  ownerName: string;
  planName: string;
  billingCycle: string | null;
  created_at: string;
}

export async function getRecentSubscriptions(): Promise<
  RecentSubscriptionRow[]
> {
  await requirePermission("dashboard:read");
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select(
      "id, plan_name, billing_cycle, created_at, owners(first_name, last_name)",
    )
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT);

  return (data ?? []).map((r) => ({
    id: r.id,
    ownerName: r.owners
      ? `${r.owners.first_name} ${r.owners.last_name ?? ""}`.trim()
      : "—",
    planName: r.plan_name,
    billingCycle: r.billing_cycle,
    created_at: r.created_at,
  }));
}
