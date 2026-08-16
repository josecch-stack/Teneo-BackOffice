import { notFound } from "next/navigation";
import { getVaccine, updateVaccine } from "../actions";
import { VaccineForm } from "../vaccine-form";

export default async function VaccineDetailPage(
  props: PageProps<"/vaccines/[id]">,
) {
  const { id } = await props.params;
  const vaccine = await getVaccine(id);

  if (!vaccine) notFound();

  const updateVaccineWithId = updateVaccine.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{vaccine.vaccine_name}</h1>
        <p className="text-muted-foreground text-sm">
          {vaccine.pets ? `Mascota: ${vaccine.pets.name}` : "Ficha de vacuna"}
        </p>
      </div>

      <VaccineForm
        action={updateVaccineWithId}
        vaccine={vaccine}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
