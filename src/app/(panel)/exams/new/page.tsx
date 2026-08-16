import { createLabExam, createImagingExam } from "../actions";
import { LabExamForm } from "../lab-exam-form";
import { ImagingExamForm } from "../imaging-exam-form";

export default async function NewExamPage(props: PageProps<"/exams/new">) {
  const searchParams = await props.searchParams;
  const type = searchParams.type === "imaging" ? "imaging" : "lab";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {type === "lab"
            ? "Nuevo examen de laboratorio"
            : "Nuevo examen de imagenología"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {type === "lab"
            ? "Registra un resultado de laboratorio."
            : "Registra un estudio de imagenología."}
        </p>
      </div>

      {type === "lab" ? (
        <LabExamForm action={createLabExam} submitLabel="Crear examen" />
      ) : (
        <ImagingExamForm
          action={createImagingExam}
          submitLabel="Crear examen"
        />
      )}
    </div>
  );
}
