import { createClinicalNote } from "../actions";
import { ClinicalNoteForm } from "../clinical-note-form";

export default function NewClinicalNotePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nueva nota clínica</h1>
        <p className="text-muted-foreground text-sm">
          Registra una consulta, cirugía u otro evento clínico.
        </p>
      </div>

      <ClinicalNoteForm
        action={createClinicalNote}
        submitLabel="Crear nota clínica"
      />
    </div>
  );
}
