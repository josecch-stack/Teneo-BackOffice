import { notFound } from "next/navigation";
import { getDeworming, updateDeworming } from "../actions";
import { DewormingForm } from "../deworming-form";

export default async function DewormingDetailPage(
  props: PageProps<"/dewormings/[id]">,
) {
  const { id } = await props.params;
  const deworming = await getDeworming(id);

  if (!deworming) notFound();

  const updateDewormingWithId = updateDeworming.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{deworming.product}</h1>
        <p className="text-muted-foreground text-sm">
          {deworming.pets
            ? `Mascota: ${deworming.pets.name}`
            : "Ficha de desparasitación"}
        </p>
      </div>

      <DewormingForm
        action={updateDewormingWithId}
        deworming={deworming}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
