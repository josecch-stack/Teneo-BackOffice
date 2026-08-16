import { createVaccine } from "../actions";
import { VaccineForm } from "../vaccine-form";

export default function NewVaccinePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nueva vacuna</h1>
        <p className="text-muted-foreground text-sm">
          Registra la aplicación de una vacuna.
        </p>
      </div>

      <VaccineForm action={createVaccine} submitLabel="Crear vacuna" />
    </div>
  );
}
