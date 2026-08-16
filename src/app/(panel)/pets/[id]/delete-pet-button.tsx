"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePet } from "../actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";

export function DeletePetButton({
  petId,
  petName,
}: {
  petId: string;
  petName: string;
}) {
  const router = useRouter();

  async function handleConfirm() {
    try {
      await deletePet(petId);
      router.push("/pets");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo eliminar la mascota.",
      );
      throw err;
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <DialogTrigger
          render={
            <Button variant="destructive" className="h-12 rounded-full px-6" />
          }
        >
          Eliminar mascota
        </DialogTrigger>
      }
      title="Eliminar mascota"
      description={`Esta acción marca a ${petName} como eliminada. No se borra información ni su historial clínico — deja de aparecer en el panel, y una vez coordinado con el equipo de la app, también en la aplicación móvil.`}
      requireTypedConfirmation={petName}
      confirmLabel="Eliminar mascota"
      onConfirm={handleConfirm}
    />
  );
}
