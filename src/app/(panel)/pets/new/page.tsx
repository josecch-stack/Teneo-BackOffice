import { createPet } from "../actions";
import { PetForm } from "../pet-form";

export default function NewPetPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nueva mascota</h1>
        <p className="text-muted-foreground text-sm">
          Registra una mascota para un tutor existente.
        </p>
      </div>

      <PetForm action={createPet} submitLabel="Crear mascota" />
    </div>
  );
}
