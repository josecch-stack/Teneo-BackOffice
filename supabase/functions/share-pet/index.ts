// "Compartir mascota" — la app arma el PDF (carnet + historial clínico, con
// su propia lógica cliente, igual que ya hace el panel para su carnet) y
// llama a esta función con la sesión del propio tutor. Esta función NO
// vuelve a armar el PDF: solo valida al dueño, deja constancia en
// `pet_shares` y envía el correo prediseñado con ese PDF adjunto vía Resend.
//
// Se corre con el JWT del tutor (no service_role) a propósito: toda la
// autorización real la resuelve el RLS ya existente de `pet_shares`
// ("Owners can create shares for own pets", requiere is_pet_owner(pet_id)) —
// mismo criterio que el resto del proyecto (ver docs/migrations-propuestas.md
// Propuesta 13: "quien arma el PDF es el propio dueño, con su propia
// sesión").
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 20;
const MAX_PDF_BYTES = 8 * 1024 * 1024;

interface ShareRequest {
  pet_id: string;
  recipients: string[];
  pdf_base64: string;
}

/** Valida que el base64 decodifique a bytes reales que empiecen con la firma
 * %PDF- (no cualquier binario arbitrario haciéndose pasar por PDF). Devuelve
 * el base64 "limpio" (sin el prefijo data:...;base64, si vino con él) listo
 * para mandar tal cual a la API de Resend, que lo quiere en base64. */
function validatePdfBase64(raw: string): string | null {
  try {
    const cleaned = raw.replace(/^data:application\/pdf;base64,/, "");
    const binary = atob(cleaned);
    if (binary.length > MAX_PDF_BYTES) return null;
    if (binary.slice(0, 5) !== "%PDF-") return null;
    return cleaned;
  } catch {
    return null;
  }
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

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromAddress = Deno.env.get("SHARE_EMAIL_FROM");
    if (!resendApiKey || !fromAddress) {
      return json(
        {
          error:
            "Faltan secrets de correo (RESEND_API_KEY / SHARE_EMAIL_FROM) en la configuración de esta función.",
        },
        500,
      );
    }

    let body: ShareRequest;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Body inválido, se esperaba JSON." }, 400);
    }

    const petId = body.pet_id;
    if (!petId || typeof petId !== "string") {
      return json({ error: "Falta pet_id." }, 400);
    }

    const recipients = [
      ...new Set(
        (body.recipients ?? [])
          .filter((e): e is string => typeof e === "string")
          .map((e) => e.trim().toLowerCase())
          .filter((e) => EMAIL_RE.test(e)),
      ),
    ];
    if (recipients.length === 0) {
      return json({ error: "No se recibió ningún correo válido." }, 400);
    }
    if (recipients.length > MAX_RECIPIENTS) {
      return json(
        { error: `Máximo ${MAX_RECIPIENTS} destinatarios por envío.` },
        400,
      );
    }

    const pdfBase64 = validatePdfBase64(body.pdf_base64 ?? "");
    if (!pdfBase64) {
      return json(
        { error: "pdf_base64 falta, no es un PDF válido, o supera 8MB." },
        400,
      );
    }

    // Cliente con el JWT del tutor (no service_role) — todas las queries de
    // aquí en adelante corren con SU RLS, no con acceso total.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ error: "Sesión inválida o expirada." }, 401);
    }

    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("name, owners(first_name)")
      .eq("id", petId)
      .is("deleted_at", null)
      .single();
    if (petError || !pet) {
      return json({ error: "Mascota no encontrada." }, 404);
    }
    const ownerFirstName =
      (pet.owners as { first_name: string } | null)?.first_name ??
      "Un tutor de Teneo";

    // Un INSERT por destinatario, no un solo batch: `pet_shares` tiene
    // `uq_pet_share` (UNIQUE pet_id, shared_with_email — del esquema
    // original de la app, no algo agregado acá), así que re-compartir con
    // un contacto ya compartido antes viola esa constraint. En un batch
    // único eso hacía fallar el statement completo y bloqueaba también a
    // los destinatarios nuevos y válidos del mismo request (bug real
    // encontrado probando con el equipo de app). Acá se trata como algo
    // normal — se reenvía el correo igual, solo no se duplica la fila.
    //
    // is_pet_owner(pet_id) en el WITH CHECK de "Owners can create shares
    // for own pets" es el mismo para cualquier fila de esta mascota — si
    // falla en el primer intento, corta altiro sin seguir probando el
    // resto (no tiene sentido reintentar por cada destinatario).
    const emailErrors = new Map<string, string>();
    const toSend: string[] = [];
    for (const email of recipients) {
      const { error: insertError } = await supabase.from("pet_shares").insert({
        pet_id: petId,
        shared_by: user.id,
        shared_with_email: email,
      });
      if (!insertError) {
        toSend.push(email);
        continue;
      }
      const forbidden =
        insertError.code === "42501" || insertError.code === "PGRST301";
      if (forbidden) {
        return json(
          { error: "No tienes permiso para compartir esta mascota." },
          403,
        );
      }
      const alreadyShared = insertError.code === "23505";
      if (alreadyShared) {
        toSend.push(email); // ya compartida antes con este correo — se reenvía igual
        continue;
      }
      emailErrors.set(email, insertError.message);
    }

    const subject = `${ownerFirstName} compartió el historial de ${pet.name} contigo`;
    const html = `
      <div style="font-family: Helvetica, Arial, sans-serif; color: #131214; max-width: 480px; margin: 0 auto;">
        <p style="font-size: 18px; font-weight: bold; color: #4160e9; margin-bottom: 24px;">Teneo Pet</p>
        <p>${ownerFirstName} te compartió los datos, historial clínico y carnet digital de <strong>${pet.name}</strong>.</p>
        <p>Revisa el PDF adjunto a este correo para ver el detalle.</p>
        <p style="color: #6e7375; font-size: 12px; margin-top: 32px;">Este correo fue generado automáticamente por Teneo Pet a pedido del tutor de la mascota.</p>
      </div>
    `;
    const attachmentFilename = `${pet.name.replace(/[^a-zA-Z0-9-_]/g, "_")}-teneo.pdf`;

    const sendResults = await Promise.all(
      toSend.map(async (email) => {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromAddress,
              to: email,
              subject,
              html,
              attachments: [
                { filename: attachmentFilename, content: pdfBase64 },
              ],
            }),
          });
          if (!res.ok) {
            const errText = await res.text();
            console.error(
              `share-pet: Resend rechazó el envío a ${email}:`,
              errText,
            );
            return { email, sent: false, error: errText };
          }
          return { email, sent: true };
        } catch (err) {
          console.error(`share-pet: envío falló para ${email}:`, err);
          return {
            email,
            sent: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      }),
    );

    const results = [
      ...sendResults,
      ...[...emailErrors].map(([email, error]) => ({
        email,
        sent: false,
        error: `No se pudo registrar el envío: ${error}`,
      })),
    ];
    const sentCount = results.filter((r) => r.sent).length;
    return json({
      pet_name: pet.name,
      results,
      sent_count: sentCount,
      failed_count: results.length - sentCount,
    });
  } catch (err) {
    console.error("share-pet crashed:", err);
    return json(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});
