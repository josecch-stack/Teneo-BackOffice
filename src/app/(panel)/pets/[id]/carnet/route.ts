import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit/log";
import { CarnetDocument } from "./carnet-document";

// Best-effort: the carnet spec (Módulo VII) asks for the profile photo, but a
// broken/slow image URL must never fail PDF generation — fetch with a short
// timeout and fall back to no photo on any error.
async function fetchPhotoAsDataUri(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/pets/[id]/carnet">,
) {
  await requirePermission("pet:read");
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: pet, error } = await supabase
    .from("pets")
    .select("*, owners(first_name, last_name, rut, phone, email, address)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !pet) {
    return Response.json({ error: "Mascota no encontrada." }, { status: 404 });
  }

  const [{ data: vaccines }, { data: dewormings }, { data: clinicalNotes }] =
    await Promise.all([
      supabase
        .from("vaccines")
        .select(
          "vaccine_name, application_type, application_date, next_dose_date, brand_lab, vet_name",
        )
        .eq("pet_id", id)
        .is("deleted_at", null)
        .order("application_date", { ascending: false })
        .limit(8),
      supabase
        .from("dewormings")
        .select("product, type, application_date, next_dose_date")
        .eq("pet_id", id)
        .is("deleted_at", null)
        .order("application_date", { ascending: false })
        .limit(5),
      supabase
        .from("clinical_notes")
        .select("event_type, event_date, notes_diagnosis")
        .eq("pet_id", id)
        .is("deleted_at", null)
        .order("event_date", { ascending: false })
        .limit(5),
    ]);

  const photoDataUri = await fetchPhotoAsDataUri(pet.profile_photo_url);

  const buffer = await renderToBuffer(
    CarnetDocument({
      pet,
      photoDataUri,
      vaccines: vaccines ?? [],
      dewormings: dewormings ?? [],
      clinicalNotes: clinicalNotes ?? [],
      generatedAt: new Date(),
    }),
  );

  await writeAuditLog({
    action: "export",
    resource: "pet_carnet",
    recordId: id,
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="carnet-${pet.name.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf"`,
    },
  });
}
