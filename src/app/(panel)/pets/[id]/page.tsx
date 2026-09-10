import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { getPet, updatePet } from "../actions";
import { PetForm } from "../pet-form";
import { DeletePetButton } from "./delete-pet-button";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { formatDateCL } from "@/lib/utils/date";

export default async function PetDetailPage(props: PageProps<"/pets/[id]">) {
  const { id } = await props.params;
  const pet = await getPet(id);

  if (!pet) notFound();

  const updatePetWithId = updatePet.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{pet.name}</h1>
            {pet.deceased_at && (
              <Badge
                variant="outline"
                className="text-muted-foreground font-normal"
              >
                En memoria desde el {formatDateCL(pet.deceased_at)}
              </Badge>
            )}
          </div>
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
