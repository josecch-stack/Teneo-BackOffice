// Valida del lado servidor una compra de suscripción hecha con in_app_purchase
// (Teneo-App) contra la API oficial de Google Play o Apple, y solo si es
// real y vigente, escribe en `subscriptions` con service_role — cierra la
// parte de G13 (docs/gaps.md) que la Propuesta 19 dejó explícitamente
// pendiente: hasta ahora el cliente escribía `status: active` directo con su
// propia sesión (RLS `owner_id = auth.uid()`), sin que nada comprobara que
// la compra haya ocurrido de verdad en la tienda.
//
// La app llama a esta función en vez de escribir directo a `subscriptions`
// (ver PurchaseProvider._persistPurchase en Teneo-App) — le manda el
// purchase_token (Android) o transaction_id (iOS) que recibió del SDK de la
// tienda al completar la compra, con SU sesión de usuario en el header
// Authorization (así sabemos a qué owner_id pertenece).
//
// ESQUELETO: escrito y con la lógica de verificación real implementada,
// pero sin poder probarse todavía — no existen productos reales creados en
// App Store Connect ni Google Play Console al momento de escribir esto.
// Antes de poder probarla hacen falta estos secrets (Project Settings >
// Edge Functions > Secrets, o `supabase secrets set`):
//   GOOGLE_PLAY_SERVICE_ACCOUNT  — JSON completo de la service account con
//                                  acceso a la Play Developer API (Play
//                                  Console > Configuración > Acceso a la
//                                  API), mismo formato que FCM_SERVICE_ACCOUNT
//                                  de send-push-notifications.
//   ANDROID_PACKAGE_NAME         — opcional, default "com.netglobal.teneo".
//   APPLE_ISSUER_ID              — App Store Connect > Usuarios y Accesos >
//                                  Integraciones > In-App Purchase.
//   APPLE_KEY_ID                 — id de esa misma API key.
//   APPLE_PRIVATE_KEY            — contenido del .p8 descargado (PEM, con
//                                  "\n" literales igual que el private_key
//                                  de la service account de Google).
//   APPLE_BUNDLE_ID              — opcional, default "com.netglobal.teneo".
//   APPLE_ENVIRONMENT            — "production" (default) o "sandbox"; si la
//                                  llamada a uno da 404 (transacción no
//                                  encontrada), se reintenta automáticamente
//                                  contra el otro entorno.
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY ya vienen
// inyectados automáticamente en toda Edge Function, no hay que setearlos.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

function base64urlDecodeToString(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const withPad = padded + "=".repeat((4 - (padded.length % 4)) % 4);
  return atob(withPad);
}

function pemToDer(pem: string): Uint8Array {
  const normalized = pem.replace(/\\n/g, "\n");
  const body = normalized
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s/g, "");
  return Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
}

// ---------------------------------------------------------------------------
// Catálogo de productos — debe reflejar exactamente lib/core/iap_products.dart
// en Teneo-App. Los precios son los de referencia del Figma (fallback que ya
// muestra la app cuando no hay ProductDetails de la tienda); una vez existan
// productos reales, la fuente de verdad del precio pagado es la propia
// respuesta de cada tienda, no esta tabla — se usa solo como respaldo/cruce.
// ---------------------------------------------------------------------------
interface CatalogEntry {
  planName: "Plus" | "Pro";
  billingCycle: "monthly" | "annual";
  price: number;
}

const PRODUCT_CATALOG: Record<string, CatalogEntry> = {
  teneo_plus_mensual: {
    planName: "Plus",
    billingCycle: "monthly",
    price: 4200,
  },
  teneo_plus_anual: { planName: "Plus", billingCycle: "annual", price: 37900 },
  teneo_pro_mensual: { planName: "Pro", billingCycle: "monthly", price: 9900 },
  teneo_pro_anual: { planName: "Pro", billingCycle: "annual", price: 89100 },
};

// ---------------------------------------------------------------------------
// Google Play — Developer API v3, purchases.subscriptionsv2.get
// ---------------------------------------------------------------------------
interface GoogleServiceAccount {
  client_email: string;
  private_key: string;
}

async function getGoogleAccessToken(sa: GoogleServiceAccount): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(sa.private_key),
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

interface GoogleSubscriptionV2 {
  subscriptionState: string;
  lineItems?: { productId: string; expiryTime?: string }[];
  latestOrderId?: string;
}

const GOOGLE_ACTIVE_STATES = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
]);

async function verifyGooglePurchase(
  purchaseToken: string,
  expectedProductId: string,
): Promise<{ orderId: string | null; expiryTime: string | null }> {
  const raw = Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT");
  if (!raw) throw new Error("Falta el secret GOOGLE_PLAY_SERVICE_ACCOUNT.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
  } catch {
    throw new Error(
      "GOOGLE_PLAY_SERVICE_ACCOUNT no es JSON válido — pega el archivo .json completo, sin reformatear.",
    );
  }
  const sa = parsed as GoogleServiceAccount;
  if (!sa?.client_email || !sa?.private_key) {
    throw new Error(
      'GOOGLE_PLAY_SERVICE_ACCOUNT no tiene "client_email"/"private_key".',
    );
  }

  const packageName =
    Deno.env.get("ANDROID_PACKAGE_NAME") || "com.netglobal.teneo";
  const accessToken = await getGoogleAccessToken(sa);

  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
    `${packageName}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(
      `Google Play rechazó la verificación (${res.status}): ${await res.text()}`,
    );
  }
  const sub = (await res.json()) as GoogleSubscriptionV2;

  if (!GOOGLE_ACTIVE_STATES.has(sub.subscriptionState)) {
    throw new Error(
      `Suscripción no está activa en Google Play (estado: ${sub.subscriptionState}).`,
    );
  }
  const lineItem = sub.lineItems?.find(
    (li) => li.productId === expectedProductId,
  );
  if (!lineItem) {
    throw new Error(
      `El purchase_token no corresponde al producto esperado (${expectedProductId}).`,
    );
  }
  return {
    orderId: sub.latestOrderId ?? null,
    expiryTime: lineItem.expiryTime ?? null,
  };
}

// ---------------------------------------------------------------------------
// Apple — App Store Server API, GET /inApps/v1/transactions/{id}
// ---------------------------------------------------------------------------
async function getAppleJwt(): Promise<string> {
  const issuerId = Deno.env.get("APPLE_ISSUER_ID");
  const keyId = Deno.env.get("APPLE_KEY_ID");
  const privateKey = Deno.env.get("APPLE_PRIVATE_KEY");
  const bundleId = Deno.env.get("APPLE_BUNDLE_ID") || "com.netglobal.teneo";
  if (!issuerId || !keyId || !privateKey) {
    throw new Error(
      "Faltan secrets de Apple (APPLE_ISSUER_ID / APPLE_KEY_ID / APPLE_PRIVATE_KEY).",
    );
  }

  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: issuerId,
    iat: now,
    exp: now + 60 * 55, // la App Store Server API rechaza JWT de más de 60 min
    aud: "appstoreconnect-v1",
    bid: bundleId,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(privateKey),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  // crypto.subtle con ECDSA firma en formato raw (r||s) — es exactamente lo
  // que espera JWS ES256, a diferencia de la firma DER que da Node por
  // default (por eso acá no hace falta ninguna conversión extra).
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64url(signature)}`;
}

interface AppleTransactionPayload {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  expiresDate?: number; // epoch ms
  purchaseDate: number; // epoch ms
  revocationDate?: number;
}

function decodeAppleSignedTransaction(jws: string): AppleTransactionPayload {
  // Se decodifica el payload sin re-verificar la cadena de certificados de
  // Apple (x5c) porque este JWS no llega desde el cliente: lo acabamos de
  // pedir nosotros mismos, sobre TLS, a la API autenticada de Apple — la
  // conexión HTTPS ya es la frontera de confianza. Si en algún momento se
  // quisiera aceptar también recibos enviados directo por el cliente sin
  // pasar por esta llamada, ahí sí haría falta verificar la firma completa.
  const parts = jws.split(".");
  if (parts.length !== 3)
    throw new Error("signedTransactionInfo no es un JWS válido.");
  return JSON.parse(
    base64urlDecodeToString(parts[1]),
  ) as AppleTransactionPayload;
}

async function verifyAppleTransaction(
  transactionId: string,
  expectedProductId: string,
): Promise<{
  originalTransactionId: string;
  expiresTimeMillis: number | null;
}> {
  const jwt = await getAppleJwt();
  const preferredEnv =
    Deno.env.get("APPLE_ENVIRONMENT") === "sandbox" ? "sandbox" : "production";
  const hosts = {
    production: "https://api.storekit.itunes.apple.com",
    sandbox: "https://api.storekit-sandbox.itunes.apple.com",
  };
  const envOrder: ("production" | "sandbox")[] =
    preferredEnv === "sandbox"
      ? ["sandbox", "production"]
      : ["production", "sandbox"];

  let lastError: string | null = null;
  for (const env of envOrder) {
    const res = await fetch(
      `${hosts[env]}/inApps/v1/transactions/${transactionId}`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      },
    );
    if (res.status === 404) {
      lastError = `Transacción no encontrada en ${env}.`;
      continue; // puede ser del otro entorno (sandbox vs producción)
    }
    if (!res.ok) {
      throw new Error(
        `Apple rechazó la verificación (${res.status}): ${await res.text()}`,
      );
    }
    const body = (await res.json()) as { signedTransactionInfo: string };
    const tx = decodeAppleSignedTransaction(body.signedTransactionInfo);

    if (tx.productId !== expectedProductId) {
      throw new Error(
        `La transacción no corresponde al producto esperado (${expectedProductId}).`,
      );
    }
    if (tx.revocationDate) {
      throw new Error("La transacción fue reembolsada/revocada por Apple.");
    }
    return {
      originalTransactionId: tx.originalTransactionId,
      expiresTimeMillis: tx.expiresDate ?? null,
    };
  }
  throw new Error(
    lastError ?? "No se pudo verificar la transacción con Apple.",
  );
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
interface VerifyRequest {
  platform: "google" | "apple";
  product_id: string;
  purchase_token?: string; // Android
  transaction_id?: string; // iOS
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Falta la sesión (header Authorization)." }, 401);
    }

    let body: VerifyRequest;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Body inválido, se esperaba JSON." }, 400);
    }

    const catalogEntry = PRODUCT_CATALOG[body.product_id];
    if (!catalogEntry) {
      return json({ error: `product_id desconocido: ${body.product_id}` }, 400);
    }
    if (body.platform !== "google" && body.platform !== "apple") {
      return json({ error: 'platform debe ser "google" o "apple".' }, 400);
    }
    if (body.platform === "google" && !body.purchase_token) {
      return json({ error: "Falta purchase_token para platform=google." }, 400);
    }
    if (body.platform === "apple" && !body.transaction_id) {
      return json({ error: "Falta transaction_id para platform=apple." }, 400);
    }

    // Cliente con el JWT del propio tutor, solo para identificarlo — igual
    // criterio que share-pet: la autorización real de qué fila puede tocar
    // la resuelve más abajo el service_role, no este cliente.
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return json({ error: "Sesión inválida o expirada." }, 401);
    }

    let orderId: string | null = null;
    let purchaseToken: string | null = null;
    let transactionId: string | null = null;
    let originalTransactionId: string | null = null;
    let expiresAtMs: number | null = null;

    if (body.platform === "google") {
      const result = await verifyGooglePurchase(
        body.purchase_token!,
        body.product_id,
      );
      orderId = result.orderId;
      purchaseToken = body.purchase_token!;
      expiresAtMs = result.expiryTime
        ? new Date(result.expiryTime).getTime()
        : null;
    } else {
      const result = await verifyAppleTransaction(
        body.transaction_id!,
        body.product_id,
      );
      transactionId = body.transaction_id!;
      originalTransactionId = result.originalTransactionId;
      expiresAtMs = result.expiresTimeMillis;
    }

    const now = new Date();
    const endDate = expiresAtMs ? new Date(expiresAtMs) : null;

    // service_role: bypassa RLS a propósito — esta es la única escritura de
    // confianza en `subscriptions` para compras reales, ya validada arriba.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: subscription, error: upsertError } = await adminClient
      .from("subscriptions")
      .upsert(
        {
          owner_id: user.id,
          plan_name: catalogEntry.planName,
          status: "active",
          start_date: now.toISOString(),
          end_date: endDate?.toISOString() ?? null,
          payment_method: body.platform,
          price: catalogEntry.price,
          billing_cycle: catalogEntry.billingCycle,
          product_id: body.product_id,
          purchase_token: purchaseToken,
          order_id: orderId,
          transaction_id: transactionId,
          original_transaction_id: originalTransactionId,
          updated_at: now.toISOString(),
        },
        { onConflict: "owner_id" },
      )
      .select()
      .single();

    if (upsertError) {
      return json(
        { error: `No se pudo guardar la suscripción: ${upsertError.message}` },
        500,
      );
    }

    return json({ subscription });
  } catch (err) {
    console.error("verify-purchase crashed:", err);
    return json(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});
