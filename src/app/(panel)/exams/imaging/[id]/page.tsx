import { notFound } from "next/navigation";
import { getImagingExam, updateImagingExam } from "../../actions";
import { ImagingExamForm } from "../../imaging-exam-form";
import { IMAGING_TYPE_LABELS } from "@/lib/validations/exam";

export default async function ImagingExamDetailPage(
  props: PageProps<"/exams/imaging/[id]">,
) {
  const { id } = await props.params;
  const imagingExam = await getImagingExam(id);

  if (!imagingExam) notFound();

  const updateImagingExamWithId = updateImagingExam.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {IMAGING_TYPE_LABELS[imagingExam.image_type] ??
            imagingExam.image_type}
        </h1>
        <p className="text-muted-foreground text-sm">
          {imagingExam.pets
            ? `Mascota: ${imagingExam.pets.name}`
            : "Examen de imagenología"}
        </p>
      </div>

      <ImagingExamForm
        action={updateImagingExamWithId}
        imagingExam={imagingExam}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
