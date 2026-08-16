// Fase 6 — envía las notificaciones pendientes de la tabla `notifications`
// vía Firebase Cloud Messaging (API HTTP v1). Pensada para correr a diario
// desde pg_cron (ver docs/migrations-propuestas.md), pero también se puede
// invocar manualmente para probar.
import { createClient } from "npm:@supabase/supabase-js@2";

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

function base64url(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Google's OAuth2 token endpoint doesn't accept the service account key
 * directly — it wants a short-lived JWT signed with that key's private key,
 * exchanged for an access token. This builds and signs that JWT by hand via
 * Web Crypto (available natively in the Deno Edge Function runtime), so no
 * extra Google auth library is needed. */
async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;

  // private_key in the downloaded JSON is PEM with literal "\n" — decode to
  // real newlines, strip the PEM wrapper, and base64-decode the remainder to
  // the raw DER bytes crypto.subtle.importKey expects.
  const pem = sa.private_key.replace(/\\n/g, "\n");
  const pemBody = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const der = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `No se pudo obtener el access token de Google: ${await res.text()}`,
    );
  }
  const data = await res.json();
  return data.access_token as string;
}

interface PendingNotification {
  id: string;
  owner_id: string;
  title: string;
  message: string;
}

Deno.serve(async () => {
  // Everything wrapped so a thrown error always comes back as a readable
  // JSON body instead of a bare "Internal Server Error" — this function is
  // only ever called by us (cron or manual test), never end users, so it's
  // safe to expose the real error message here instead of just logging it.
  try {
    const serviceAccountRaw = Deno.env.get("FCM_SERVICE_ACCOUNT");
    if (!serviceAccountRaw) {
      return new Response(
        JSON.stringify({ error: "Falta el secret FCM_SERVICE_ACCOUNT" }),
        { status: 500 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(serviceAccountRaw);
      // If the secret was saved with an extra layer of escaping (the stored
      // value is itself a JSON-encoded string), the first parse yields a
      // string, not an object — parse once more to unwrap it.
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
    } catch {
      return new Response(
        JSON.stringify({
          error:
            "FCM_SERVICE_ACCOUNT no es JSON válido — revisa que se haya pegado el archivo .json completo, sin reformatear.",
        }),
        { status: 500 },
      );
    }
    const serviceAccount = parsed as ServiceAccount;
    for (const field of [
      "client_email",
      "private_key",
      "project_id",
    ] as const) {
      if (!serviceAccount?.[field]) {
        return new Response(
          JSON.stringify({
            error: `FCM_SERVICE_ACCOUNT no tiene el campo "${field}" esperado.`,
            // Safe diagnostics — never the private key itself.
            debug: {
              type: typeof parsed,
              keys:
                parsed && typeof parsed === "object"
                  ? Object.keys(parsed)
                  : null,
            },
          }),
          { status: 500 },
        );
      }
    }

    // SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically
    // into every Edge Function — no need to set them as secrets ourselves.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: pending, error } = await supabase
      .from("notifications")
      .select("id, owner_id, title, message")
      .is("sent_at", null)
      .lte("trigger_date", new Date().toISOString())
      .returns<PendingNotification[]>();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ sent: 0, failed: 0, skipped: 0 }), {
        status: 200,
      });
    }

    // A tutor's tokens can live in two places: the legacy single-token
    // column (owners.fcm_token, still what's populated today) and the newer
    // multi-device push_devices table (Propuesta 11) — send to every known
    // token for each owner, deduplicated, so this keeps working during the
    // mobile team's transition to multi-device registration.
    const ownerIds = [...new Set(pending.map((n) => n.owner_id))];
    const [{ data: owners }, { data: devices }] = await Promise.all([
      supabase
        .from("owners")
        .select("user_id, fcm_token")
        .in("user_id", ownerIds),
      supabase
        .from("push_devices")
        .select("owner_id, fcm_token")
        .in("owner_id", ownerIds),
    ]);

    const tokensByOwner = new Map<string, Set<string>>();
    for (const o of owners ?? []) {
      if (o.fcm_token) tokensByOwner.set(o.user_id, new Set([o.fcm_token]));
    }
    for (const d of devices ?? []) {
      const set = tokensByOwner.get(d.owner_id) ?? new Set<string>();
      set.add(d.fcm_token);
      tokensByOwner.set(d.owner_id, set);
    }

    const accessToken = await getAccessToken(serviceAccount);

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const n of pending) {
      const tokens = tokensByOwner.get(n.owner_id);
      if (!tokens || tokens.size === 0) {
        skipped++;
        continue;
      }

      let deliveredToAtLeastOne = false;
      for (const token of tokens) {
        const res = await fetch(
          `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: {
                token,
                notification: { title: n.title, body: n.message },
              },
            }),
          },
        );

        if (res.ok) {
          deliveredToAtLeastOne = true;
        } else {
          console.error(
            `FCM send failed for notification ${n.id}, token ${token}:`,
            await res.text(),
          );
        }
      }

      if (deliveredToAtLeastOne) {
        sent++;
        await supabase
          .from("notifications")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", n.id);
      } else {
        failed++;
      }
    }

    return new Response(JSON.stringify({ sent, failed, skipped }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("send-push-notifications crashed:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
