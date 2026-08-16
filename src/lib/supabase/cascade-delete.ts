import "server-only";
import { createAdminClient } from "./admin";

/**
 * Soft-deletes a pet's clinical history (vaccines, dewormings, clinical
 * notes, lab/imaging exams) — see docs/migrations-propuestas.md Propuesta 9.
 * Called from both `deletePet` and `deleteOwner`'s per-pet cascade. Uses the
 * admin client because the caller's authorization (pet:write/owner:write)
 * shouldn't need to also hold vaccine:write/clinical_note:write/exam:write
 * for the cascade to actually land — RLS on those tables is scoped to their
 * own permissions, not pet:write.
 */
export async function cascadeDeletePetClinicalRecords(
  petId: string,
  deletedAt: string,
) {
  const admin = createAdminClient();
  await Promise.all([
    admin
      .from("vaccines")
      .update({ deleted_at: deletedAt })
      .eq("pet_id", petId)
      .is("deleted_at", null),
    admin
      .from("dewormings")
      .update({ deleted_at: deletedAt })
      .eq("pet_id", petId)
      .is("deleted_at", null),
    admin
      .from("clinical_notes")
      .update({ deleted_at: deletedAt })
      .eq("pet_id", petId)
      .is("deleted_at", null),
    admin
      .from("lab_exams")
      .update({ deleted_at: deletedAt })
      .eq("pet_id", petId)
      .is("deleted_at", null),
    admin
      .from("imaging_exams")
      .update({ deleted_at: deletedAt })
      .eq("pet_id", petId)
      .is("deleted_at", null),
  ]);
}
