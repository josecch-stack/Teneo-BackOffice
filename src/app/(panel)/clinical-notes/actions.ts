"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit/log";
import {
  clinicalNoteFormSchema,
  medicationSchema,
} from "@/lib/validations/clinical-note";

const PAGE_SIZE = 20;

export interface ListClinicalNotesParams {
  q?: string;
  page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

const SORTABLE_COLUMNS = new Set(["event_date", "created_at"]);

export async function listClinicalNotes(params: ListClinicalNotesParams) {
  await requirePermission("clinical_note:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const sort = SORTABLE_COLUMNS.has(params.sort ?? "")
    ? params.sort!
    : "event_date";
  const dir = params.dir === "asc";

  let query = supabase
    .from("clinical_notes")
    .select(
      "id, event_type, event_date, reason, veterinarian, has_prescription, pets(id, name, owners(first_name, last_name))",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (params.q) {
    query = query.ilike("reason", `%${params.q.trim()}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await query
    .order(sort, { ascending: dir })
    .range(from, to);

  if (error) {
    console.error("listClinicalNotes failed", error);
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

export async function getClinicalNote(id: string) {
  await requirePermission("clinical_note:read");
  const supabase = await createClient();

  const { data: note, error } = await supabase
    .from("clinical_notes")
    .select(
      "*, pets(id, name, species, chip_number, owners(first_name, last_name))",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !note) return null;

  const { data: prescription } = await supabase
    .from("prescriptions")
    .select("*, medications(*)")
    .eq("clinical_note_id", id)
    .maybeSingle();

  return { ...note, prescription };
}

export interface ClinicalNoteFormState {
  error?: string;
  success?: boolean;
}

function parseClinicalNoteFormData(formData: FormData) {
  // FormData.get() returns null for fields absent from the DOM (the
  // prescription section only renders when has_prescription is checked) —
  // normalize to undefined so it doesn't fail .optional() validation.
  const str = (key: string) => formData.get(key) || undefined;

  return clinicalNoteFormSchema.safeParse({
    pet_id: str("pet_id"),
    event_type: str("event_type"),
    event_date: str("event_date"),
    reason: str("reason"),
    veterinarian: str("veterinarian"),
    clinic: str("clinic"),
    notes_diagnosis: str("notes_diagnosis"),
    has_prescription: formData.get("has_prescription") === "on",
    general_instructions: str("general_instructions"),
    prescription_date: str("prescription_date"),
    next_checkup_date: str("next_checkup_date"),
  });
}

/** Returns null if the JSON payload is malformed or fails validation. */
function parseMedications(formData: FormData) {
  const raw = formData.get("medications_json");
  if (typeof raw !== "string" || !raw) return [];
  try {
    return z.array(medicationSchema).parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function createClinicalNote(
  _prevState: ClinicalNoteFormState,
  formData: FormData,
): Promise<ClinicalNoteFormState> {
  await requirePermission("clinical_note:write");
  const parsed = parseClinicalNoteFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const meds = parseMedications(formData);
  if (meds === null) {
    return { error: "Los medicamentos ingresados no son válidos." };
  }

  const supabase = await createClient();
  const v = parsed.data;

  const { data: createdNote, error } = await supabase
    .from("clinical_notes")
    .insert({
      pet_id: v.pet_id,
      event_type: v.event_type ?? null,
      event_date: v.event_date,
      reason: v.reason || null,
      veterinarian: v.veterinarian || null,
      clinic: v.clinic || null,
      notes_diagnosis: v.notes_diagnosis,
      has_prescription: v.has_prescription,
    })
    .select("id")
    .single();

  if (error || !createdNote) {
    return { error: "No se pudo crear la nota clínica. Intenta de nuevo." };
  }

  if (v.has_prescription) {
    const { data: createdPrescription, error: prescError } = await supabase
      .from("prescriptions")
      .insert({
        clinical_note_id: createdNote.id,
        general_instructions: v.general_instructions || null,
        prescription_date: v.prescription_date || null,
        next_checkup_date: v.next_checkup_date || null,
      })
      .select("id")
      .single();

    if (prescError || !createdPrescription) {
      return { error: "La nota se creó, pero no se pudo guardar la receta." };
    }

    if (meds.length) {
      const { error: medsError } = await supabase.from("medications").insert(
        meds.map((m) => ({
          prescription_id: createdPrescription.id,
          name: m.name,
          dosage: m.dosage || null,
          frequency_hours: m.frequency_hours ?? null,
          duration_days: m.duration_days ?? null,
          start_datetime: m.start_datetime || null,
        })),
      );
      if (medsError) {
        return {
          error:
            "La nota y la receta se crearon, pero no se pudieron guardar los medicamentos.",
        };
      }
    }
  }

  await writeAuditLog({
    action: "create",
    resource: "clinical_note",
    recordId: createdNote.id,
    newValues: v,
  });

  revalidatePath("/clinical-notes");
  redirect(`/clinical-notes/${createdNote.id}`);
}

export async function updateClinicalNote(
  id: string,
  _prevState: ClinicalNoteFormState,
  formData: FormData,
): Promise<ClinicalNoteFormState> {
  await requirePermission("clinical_note:write");
  const parsed = parseClinicalNoteFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const meds = parseMedications(formData);
  if (meds === null) {
    return { error: "Los medicamentos ingresados no son válidos." };
  }

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("clinical_notes")
    .select("*")
    .eq("id", id)
    .single();
  const v = parsed.data;

  const { error } = await supabase
    .from("clinical_notes")
    .update({
      pet_id: v.pet_id,
      event_type: v.event_type ?? null,
      event_date: v.event_date,
      reason: v.reason || null,
      veterinarian: v.veterinarian || null,
      clinic: v.clinic || null,
      notes_diagnosis: v.notes_diagnosis,
      has_prescription: v.has_prescription,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  if (v.has_prescription) {
    const { data: existingPrescription } = await supabase
      .from("prescriptions")
      .select("id")
      .eq("clinical_note_id", id)
      .maybeSingle();

    let prescriptionId = existingPrescription?.id as string | undefined;

    if (prescriptionId) {
      await supabase
        .from("prescriptions")
        .update({
          general_instructions: v.general_instructions || null,
          prescription_date: v.prescription_date || null,
          next_checkup_date: v.next_checkup_date || null,
        })
        .eq("id", prescriptionId);
    } else {
      const { data: createdPrescription } = await supabase
        .from("prescriptions")
        .insert({
          clinical_note_id: id,
          general_instructions: v.general_instructions || null,
          prescription_date: v.prescription_date || null,
          next_checkup_date: v.next_checkup_date || null,
        })
        .select("id")
        .single();
      prescriptionId = createdPrescription?.id;
    }

    if (prescriptionId) {
      // Full replace — simpler and just as correct as diffing individual rows.
      await supabase
        .from("medications")
        .delete()
        .eq("prescription_id", prescriptionId);
      if (meds.length) {
        await supabase.from("medications").insert(
          meds.map((m) => ({
            prescription_id: prescriptionId,
            name: m.name,
            dosage: m.dosage || null,
            frequency_hours: m.frequency_hours ?? null,
            duration_days: m.duration_days ?? null,
            start_datetime: m.start_datetime || null,
          })),
        );
      }
    }
  }

  await writeAuditLog({
    action: "update",
    resource: "clinical_note",
    recordId: id,
    oldValues: before,
    newValues: v,
  });

  revalidatePath("/clinical-notes");
  revalidatePath(`/clinical-notes/${id}`);
  return { success: true };
}
