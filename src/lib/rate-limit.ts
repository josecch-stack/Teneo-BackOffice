import { headers } from "next/headers";

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory, per-instance fixed-window limiter — resets on redeploy/restart.
// Accepted tradeoff for this panel's traffic (see docs/deploy-checklist.md):
// no external dependency, no new account to provision, and Railway runs a
// single instance today. Revisit with Upstash/Redis if that changes.
const buckets = new Map<string, Bucket>();

// Opportunistic sweep so the map doesn't grow forever — runs on a small
// fraction of calls rather than on a timer (no background work to manage).
function sweepExpired(now: number) {
  if (Math.random() > 0.01) return;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

/** Returns true if the call is allowed, false if the caller is rate-limited. */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

/** Railway (and most hosts) put the real client IP in x-forwarded-for. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}
