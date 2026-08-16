import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { getPet, updatePet } from "../actions";
import { PetForm } from "../pet-form";
import { DeletePetButton } from "./delete-pet-button";
import { LinkButton } from "@/components/ui/link-button";

export default async function PetDetailPage(props: PageProps<"/pets/[id]">) {
  const { id } = await props.params;
  const pet = await getPet(id);

  if (!pet) notFound();

  const updatePetWithId = updatePet.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{pet.name}</h1>
          <p className="text-muted-foreground text-sm">Ficha de mascota</p>
        </div>
        <div className="flex items-center gap-3">
          <LinkButton
            href={`/pets/${id}/carnet`}
            variant="outline"
            className="rounded-full"
          >
            <Download className="size-4" />
            Descargar carnet PDF
          </LinkButton>
          <DeletePetButton petId={id} petName={pet.name} />
        </div>
      </div>

      <PetForm
        action={updatePetWithId}
        pet={pet}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
