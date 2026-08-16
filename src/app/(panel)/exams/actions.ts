"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit/log";
import {
  labExamFormSchema,
  imagingExamFormSchema,
} from "@/lib/validations/exam";
import { extractStoragePath } from "@/lib/utils/storage-path";

const PAGE_SIZE = 20;
const EXAM_BUCKET = "exam-files";

export interface ListExamsParams {
  q?: string;
  page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

const SORTABLE_LAB = new Set(["result_date", "created_at"]);
const SORTABLE_IMAGING = new Set(["exam_date", "created_at"]);

export async function listLabExams(params: ListExamsParams) {
  await requirePermission("exam:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const sort = SORTABLE_LAB.has(params.sort ?? "")
    ? params.sort!
    : "result_date";
  const dir = params.dir === "asc";

  let query = supabase
    .from("lab_exams")
    .select(
      "id, exam_name, category, sample_date, result_date, lab_center, pets(id, name, owners(first_name, last_name))",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (params.q) query = query.ilike("exam_name", `%${params.q.trim()}%`);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count, error } = await query
    .order(sort, { ascending: dir })
    .range(from, to);

  if (error) {
    console.error("listLabExams failed", error);
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

export async function listImagingExams(params: ListExamsParams) {
  await requirePermission("exam:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const sort = SORTABLE_IMAGING.has(params.sort ?? "")
    ? params.sort!
    : "exam_date";
  const dir = params.dir === "asc";

  let query = supabase
    .from("imaging_exams")
    .select(
      "id, image_type, body_region, exam_date, vet_center, pets(id, name, owners(first_name, last_name))",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (params.q) query = query.ilike("body_region", `%${params.q.trim()}%`);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count, error } = await query
    .order(sort, { ascending: dir })
    .range(from, to);

  if (error) {
    console.error("listImagingExams failed", error);
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

export async function getLabExam(id: string) {
  await requirePermission("exam:read");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lab_exams")
    .select(
      "*, pets(id, name, species, chip_number, owners(first_name, last_name)), lab_exam_files(id, file_url, file_name, created_at)",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function getImagingExam(id: string) {
  await requirePermission("exam:read");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("imaging_exams")
    .select(
      "*, pets(id, name, species, chip_number, owners(first_name, last_name)), imaging_exam_files(id, file_url, file_name, created_at)",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data;
}

export async function listPetClinicalNotes(petId: string) {
  await requirePermission("exam:read");
  if (!petId) return [];
  const supabase = await createClient();

  const { data } = await supabase
    .from("clinical_notes")
    .select("id, event_date, reason")
    .eq("pet_id", petId)
    .is("deleted_at", null)
    .order("event_date", { ascending: false })
    .limit(20);

  return data ?? [];
}

/**
 * Signed URLs, never public ones (see docs/gaps.md G10 — the buckets
 * themselves are misconfigured as public, but the panel never relies on
 * that). Uses the admin client because storage.objects policies only allow
 * the tutor who owns the `{owner_id}/...` path segment to read/write — a
 * panel user's own uid never matches, same reasoning as Propuestas 3-5.
 */
export async function getExamFileSignedUrl(fileUrl: string) {
  await requirePermission("exam_file:download");
  const admin = createAdminClient();

  const path = extractStoragePath(fileUrl, EXAM_BUCKET);
  const { data, error } = await admin.storage
    .from(EXAM_BUCKET)
    .createSignedUrl(path, 60 * 5);
  if (error || !data) return null;

  await writeAuditLog({
    action: "view_file",
    resource: "exam_file",
    recordId: fileUrl,
  });
  return data.signedUrl;
}

async function uploadExamFiles(ownerId: string, petId: string, files: File[]) {
  const admin = createAdminClient();
  const uploaded: { file_url: string; file_name: string }[] = [];

  for (const file of files) {
    const path = `${ownerId}/${petId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await admin.storage
      .from(EXAM_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (error)
      throw new Error(`No se pudo subir "${file.name}": ${error.message}`);
    // Store the full public URL — matches the format the mobile app itself
    // writes to this same column (confirmed via real data, Fase 9), even
    // though the bucket being public at all is a separate issue (G10).
    const { data: publicUrlData } = admin.storage
      .from(EXAM_BUCKET)
      .getPublicUrl(path);
    uploaded.push({ file_url: publicUrlData.publicUrl, file_name: file.name });
  }

  return uploaded;
}

function collectFiles(formData: FormData) {
  return formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
}

export interface ExamFormState {
  error?: string;
  success?: boolean;
}

function parseLabExamFormData(formData: FormData) {
  const str = (key: string) => formData.get(key) || undefined;
  return labExamFormSchema.safeParse({
    pet_id: str("pet_id"),
    clinical_note_id: str("clinical_note_id"),
    exam_name: str("exam_name"),
    category: str("category"),
    sample_date: str("sample_date"),
    result_date: str("result_date"),
    lab_center: str("lab_center"),
    summary: str("summary"),
  });
}

export async function createLabExam(
  _prevState: ExamFormState,
  formData: FormData,
): Promise<ExamFormState> {
  await requirePermission("exam:write");
  const parsed = parseLabExamFormData(formData);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const v = parsed.data;
  const { data: pet } = await supabase
    .from("pets")
    .select("owner_id")
    .eq("id", v.pet_id)
    .single();
  if (!pet) return { error: "Mascota no encontrada." };

  const { data: created, error } = await supabase
    .from("lab_exams")
    .insert({
      pet_id: v.pet_id,
      clinical_note_id: v.clinical_note_id || null,
      exam_name: v.exam_name,
      category: v.category,
      sample_date: v.sample_date || null,
      result_date: v.result_date,
      lab_center: v.lab_center || null,
      summary: v.summary || null,
    })
    .select("id")
    .single();

  if (error || !created)
    return { error: "No se pudo crear el examen. Intenta de nuevo." };

  const files = collectFiles(formData);
  if (files.length) {
    try {
      const uploaded = await uploadExamFiles(pet.owner_id, v.pet_id, files);
      const { error: filesError } = await supabase
        .from("lab_exam_files")
        .insert(
          uploaded.map((u) => ({
            lab_exam_id: created.id,
            file_url: u.file_url,
            file_name: u.file_name,
          })),
        );
      if (filesError)
        return {
          error:
            "El examen se creó, pero no se pudieron adjuntar los archivos.",
        };
    } catch (e) {
      return {
        error:
          e instanceof Error ? e.message : "No se pudieron subir los archivos.",
      };
    }
  }

  await writeAuditLog({
    action: "create",
    resource: "lab_exam",
    recordId: created.id,
    newValues: v,
  });
  revalidatePath("/exams");
  redirect(`/exams/lab/${created.id}`);
}

export async function updateLabExam(
  id: string,
  _prevState: ExamFormState,
  formData: FormData,
): Promise<ExamFormState> {
  await requirePermission("exam:write");
  const parsed = parseLabExamFormData(formData);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("lab_exams")
    .select("*")
    .eq("id", id)
    .single();
  const v = parsed.data;

  const { error } = await supabase
    .from("lab_exams")
    .update({
      pet_id: v.pet_id,
      clinical_note_id: v.clinical_note_id || null,
      exam_name: v.exam_name,
      category: v.category,
      sample_date: v.sample_date || null,
      result_date: v.result_date,
      lab_center: v.lab_center || null,
      summary: v.summary || null,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };

  const files = collectFiles(formData);
  if (files.length) {
    const { data: pet } = await supabase
      .from("pets")
      .select("owner_id")
      .eq("id", v.pet_id)
      .single();
    if (pet) {
      try {
        const uploaded = await uploadExamFiles(pet.owner_id, v.pet_id, files);
        await supabase
          .from("lab_exam_files")
          .insert(
            uploaded.map((u) => ({
              lab_exam_id: id,
              file_url: u.file_url,
              file_name: u.file_name,
            })),
          );
      } catch (e) {
        return {
          error:
            e instanceof Error
              ? e.message
              : "No se pudieron subir los archivos nuevos.",
        };
      }
    }
  }

  await writeAuditLog({
    action: "update",
    resource: "lab_exam",
    recordId: id,
    oldValues: before,
    newValues: v,
  });
  revalidatePath("/exams");
  revalidatePath(`/exams/lab/${id}`);
  return { success: true };
}

function parseImagingExamFormData(formData: FormData) {
  const str = (key: string) => formData.get(key) || undefined;
  return imagingExamFormSchema.safeParse({
    pet_id: str("pet_id"),
    clinical_note_id: str("clinical_note_id"),
    image_type: str("image_type"),
    body_region: str("body_region"),
    exam_date: str("exam_date"),
    vet_center: str("vet_center"),
    findings: str("findings"),
  });
}

export async function createImagingExam(
  _prevState: ExamFormState,
  formData: FormData,
): Promise<ExamFormState> {
  await requirePermission("exam:write");
  const parsed = parseImagingExamFormData(formData);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const v = parsed.data;
  const { data: pet } = await supabase
    .from("pets")
    .select("owner_id")
    .eq("id", v.pet_id)
    .single();
  if (!pet) return { error: "Mascota no encontrada." };

  const { data: created, error } = await supabase
    .from("imaging_exams")
    .insert({
      pet_id: v.pet_id,
      clinical_note_id: v.clinical_note_id || null,
      image_type: v.image_type,
      body_region: v.body_region || null,
      exam_date: v.exam_date,
      vet_center: v.vet_center || null,
      findings: v.findings || null,
    })
    .select("id")
    .single();

  if (error || !created)
    return { error: "No se pudo crear el examen. Intenta de nuevo." };

  const files = collectFiles(formData);
  if (files.length) {
    try {
      const uploaded = await uploadExamFiles(pet.owner_id, v.pet_id, files);
      const { error: filesError } = await supabase
        .from("imaging_exam_files")
        .insert(
          uploaded.map((u) => ({
            imaging_exam_id: created.id,
            file_url: u.file_url,
            file_name: u.file_name,
          })),
        );
      if (filesError)
        return {
          error:
            "El examen se creó, pero no se pudieron adjuntar los archivos.",
        };
    } catch (e) {
      return {
        error:
          e instanceof Error ? e.message : "No se pudieron subir los archivos.",
      };
    }
  }

  await writeAuditLog({
    action: "create",
    resource: "imaging_exam",
    recordId: created.id,
    newValues: v,
  });
  revalidatePath("/exams");
  redirect(`/exams/imaging/${created.id}`);
}

export async function updateImagingExam(
  id: string,
  _prevState: ExamFormState,
  formData: FormData,
): Promise<ExamFormState> {
  await requirePermission("exam:write");
  const parsed = parseImagingExamFormData(formData);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("imaging_exams")
    .select("*")
    .eq("id", id)
    .single();
  const v = parsed.data;

  const { error } = await supabase
    .from("imaging_exams")
    .update({
      pet_id: v.pet_id,
      clinical_note_id: v.clinical_note_id || null,
      image_type: v.image_type,
      body_region: v.body_region || null,
      exam_date: v.exam_date,
      vet_center: v.vet_center || null,
      findings: v.findings || null,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };

  const files = collectFiles(formData);
  if (files.length) {
    const { data: pet } = await supabase
      .from("pets")
      .select("owner_id")
      .eq("id", v.pet_id)
      .single();
    if (pet) {
      try {
        const uploaded = await uploadExamFiles(pet.owner_id, v.pet_id, files);
        await supabase
          .from("imaging_exam_files")
          .insert(
            uploaded.map((u) => ({
              imaging_exam_id: id,
              file_url: u.file_url,
              file_name: u.file_name,
            })),
          );
      } catch (e) {
        return {
          error:
            e instanceof Error
              ? e.message
              : "No se pudieron subir los archivos nuevos.",
        };
      }
    }
  }

  await writeAuditLog({
    action: "update",
    resource: "imaging_exam",
    recordId: id,
    oldValues: before,
    newValues: v,
  });
  revalidatePath("/exams");
  revalidatePath(`/exams/imaging/${id}`);
  return { success: true };
}
