import { createDeworming } from "../actions";
import { DewormingForm } from "../deworming-form";

export default function NewDewormingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nueva desparasitación</h1>
        <p className="text-muted-foreground text-sm">
          Registra la aplicación de un antiparasitario.
        </p>
      </div>

      <DewormingForm action={createDeworming} submitLabel="Crear registro" />
    </div>
  );
}
