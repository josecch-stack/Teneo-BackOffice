"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteOwner } from "../actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";

export function DeleteOwnerButton({
  userId,
  ownerName,
}: {
  userId: string;
  ownerName: string;
}) {
  const router = useRouter();

  async function handleConfirm() {
    try {
      await deleteOwner(userId);
      router.push("/owners");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo eliminar el tutor.",
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
          Eliminar tutor
        </DialogTrigger>
      }
      title="Eliminar tutor"
      description={`Esta acción marca a ${ownerName} y todas sus mascotas como eliminados. No se borra información — deja de aparecer en el panel, y una vez coordinado con el equipo de la app, también en la aplicación móvil.`}
      requireTypedConfirmation={ownerName}
      confirmLabel="Eliminar tutor"
      onConfirm={handleConfirm}
    />
  );
}
