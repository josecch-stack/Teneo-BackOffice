import { notFound } from "next/navigation";
import { getClinicalNote, updateClinicalNote } from "../actions";
import { ClinicalNoteForm } from "../clinical-note-form";

export default async function ClinicalNoteDetailPage(
  props: PageProps<"/clinical-notes/[id]">,
) {
  const { id } = await props.params;
  const note = await getClinicalNote(id);

  if (!note) notFound();

  const updateClinicalNoteWithId = updateClinicalNote.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nota clínica</h1>
        <p className="text-muted-foreground text-sm">
          {note.pets ? `Mascota: ${note.pets.name}` : "Ficha de nota clínica"}
        </p>
      </div>

      <ClinicalNoteForm
        action={updateClinicalNoteWithId}
        note={note}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
