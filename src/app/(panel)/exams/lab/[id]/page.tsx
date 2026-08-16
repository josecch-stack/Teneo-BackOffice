import { notFound } from "next/navigation";
import { getLabExam, updateLabExam } from "../../actions";
import { LabExamForm } from "../../lab-exam-form";

export default async function LabExamDetailPage(
  props: PageProps<"/exams/lab/[id]">,
) {
  const { id } = await props.params;
  const labExam = await getLabExam(id);

  if (!labExam) notFound();

  const updateLabExamWithId = updateLabExam.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{labExam.exam_name}</h1>
        <p className="text-muted-foreground text-sm">
          {labExam.pets
            ? `Mascota: ${labExam.pets.name}`
            : "Examen de laboratorio"}
        </p>
      </div>

      <LabExamForm
        action={updateLabExamWithId}
        labExam={labExam}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
