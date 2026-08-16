"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit/log";
import { extractStoragePath } from "@/lib/utils/storage-path";

const PAGE_SIZE = 20;

export type DocumentType =
  | "chip_certificate"
  | "vaccine_receipt"
  | "prescription"
  | "lab_exam_file"
  | "imaging_exam_file";

const BUCKET_BY_TYPE: Record<DocumentType, string> = {
  chip_certificate: "chip-certificates",
  vaccine_receipt: "vaccine-receipts",
  prescription: "prescription-files",
  lab_exam_file: "exam-files",
  imaging_exam_file: "exam-files",
};

// Mirrors the folder convention the mobile app already uses inside each
// bucket (confirmed via real data) — kept consistent for anything the panel
// uploads too.
const SUBFOLDER_BY_TYPE: Record<DocumentType, string> = {
  chip_certificate: "chip-certificates",
  vaccine_receipt: "vaccine-receipts",
  prescription: "prescription-files",
  lab_exam_file: "exam-files",
  imaging_exam_file: "exam-files",
};

export interface DocumentRow {
  document_type: DocumentType;
  file_url: string;
  file_name: string | null;
  pet_id: string;
  pet_name: string;
  owner_id: string;
  owner_first_name: string;
  owner_last_name: string | null;
  source_module: string;
  source_id: string;
  created_at: string;
}

export interface ListDocumentsParams {
  q?: string;
  documentType?: DocumentType;
  page?: number;
}

export async function listDocuments(params: ListDocumentsParams) {
  await requirePermission("document:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("panel_documents").select("*", { count: "exact" });

  if (params.documentType)
    query = query.eq("document_type", params.documentType);
  if (params.q) {
    const q = params.q.trim();
    query = query.or(
      `pet_name.ilike.%${q}%,owner_first_name.ilike.%${q}%,owner_last_name.ilike.%${q}%,file_name.ilike.%${q}%`,
    );
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("listDocuments failed", error);
    return { rows: [], rowCount: 0, pageCount: 0, page };
  }

  const rowCount = count ?? 0;
  return {
    rows: (data ?? []) as DocumentRow[],
    rowCount,
    pageCount: Math.max(Math.ceil(rowCount / PAGE_SIZE), 1),
    page,
  };
}

/**
 * Signed URL only, never public (see docs/gaps.md G10). Admin client because
 * storage.objects policies only let the tutor who owns the path segment
 * read/write — never a panel user.
 */
export async function getDocumentSignedUrl(
  documentType: DocumentType,
  fileUrl: string,
) {
  await requirePermission("document:read");
  const admin = createAdminClient();
  const bucket = BUCKET_BY_TYPE[documentType];

  const path = extractStoragePath(fileUrl, bucket);
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 5);
  if (error || !data) return null;

  await writeAuditLog({
    action: "view_file",
    resource: "document",
    recordId: fileUrl,
  });
  return data.signedUrl;
}

async function findOwnerIdForPet(petId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("pets")
    .select("owner_id")
    .eq("id", petId)
    .single();
  return data?.owner_id ?? null;
}

export async function deleteDocument(
  documentType: DocumentType,
  sourceId: string,
  fileUrl: string,
) {
  await requirePermission("document:manage");
  const admin = createAdminClient();
  const bucket = BUCKET_BY_TYPE[documentType];
  const path = extractStoragePath(fileUrl, bucket);

  await admin.storage.from(bucket).remove([path]);

  switch (documentType) {
    case "chip_certificate":
      await admin
        .from("pets")
        .update({ chip_certificate_url: null })
        .eq("id", sourceId);
      break;
    case "vaccine_receipt":
      await admin
        .from("vaccines")
        .update({ receipt_url: null })
        .eq("id", sourceId);
      break;
    case "prescription":
      await admin
        .from("prescriptions")
        .update({ file_url: null })
        .eq("id", sourceId);
      break;
    case "lab_exam_file":
      await admin.from("lab_exam_files").delete().eq("id", sourceId);
      break;
    case "imaging_exam_file":
      await admin.from("imaging_exam_files").delete().eq("id", sourceId);
      break;
  }

  await writeAuditLog({
    action: "delete",
    resource: "document",
    recordId: sourceId,
    oldValues: { documentType, fileUrl },
  });
  revalidatePath("/documents");
}

export async function replaceDocument(
  documentType: DocumentType,
  sourceId: string,
  petId: string,
  oldFileUrl: string,
  formData: FormData,
) {
  await requirePermission("document:manage");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecciona un archivo.");
  }

  const admin = createAdminClient();
  const bucket = BUCKET_BY_TYPE[documentType];
  const ownerId = await findOwnerIdForPet(petId);
  if (!ownerId)
    throw new Error("No se pudo determinar el tutor de esta mascota.");

  const newPath = `${ownerId}/${SUBFOLDER_BY_TYPE[documentType]}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(newPath, file, { contentType: file.type });
  if (uploadError)
    throw new Error(`No se pudo subir el archivo: ${uploadError.message}`);

  const { data: publicUrlData } = admin.storage
    .from(bucket)
    .getPublicUrl(newPath);
  const newUrl = publicUrlData.publicUrl;

  switch (documentType) {
    case "chip_certificate":
      await admin
        .from("pets")
        .update({ chip_certificate_url: newUrl })
        .eq("id", sourceId);
      break;
    case "vaccine_receipt":
      await admin
        .from("vaccines")
        .update({ receipt_url: newUrl })
        .eq("id", sourceId);
      break;
    case "prescription":
      await admin
        .from("prescriptions")
        .update({ file_url: newUrl })
        .eq("id", sourceId);
      break;
    case "lab_exam_file": {
      const { data: existing } = await admin
        .from("lab_exam_files")
        .select("lab_exam_id")
        .eq("id", sourceId)
        .single();
      if (existing) {
        await admin
          .from("lab_exam_files")
          .insert({
            lab_exam_id: existing.lab_exam_id,
            file_url: newUrl,
            file_name: file.name,
          });
      }
      await admin.from("lab_exam_files").delete().eq("id", sourceId);
      break;
    }
    case "imaging_exam_file": {
      const { data: existing } = await admin
        .from("imaging_exam_files")
        .select("imaging_exam_id")
        .eq("id", sourceId)
        .single();
      if (existing) {
        await admin
          .from("imaging_exam_files")
          .insert({
            imaging_exam_id: existing.imaging_exam_id,
            file_url: newUrl,
            file_name: file.name,
          });
      }
      await admin.from("imaging_exam_files").delete().eq("id", sourceId);
      break;
    }
  }

  const oldPath = extractStoragePath(oldFileUrl, bucket);
  await admin.storage.from(bucket).remove([oldPath]);

  await writeAuditLog({
    action: "replace",
    resource: "document",
    recordId: sourceId,
    oldValues: { fileUrl: oldFileUrl },
    newValues: { fileUrl: newUrl },
  });

  revalidatePath("/documents");
}
