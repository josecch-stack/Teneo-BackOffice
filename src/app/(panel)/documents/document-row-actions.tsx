"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, Trash2, Replace } from "lucide-react";
import {
  getDocumentSignedUrl,
  deleteDocument,
  replaceDocument,
  type DocumentRow,
} from "./actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DocumentRowActions({
  row,
  canManage,
}: {
  row: DocumentRow;
  canManage: boolean;
}) {
  const [viewing, setViewing] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [replacePending, startReplace] = useTransition();
  const router = useRouter();

  async function handleView() {
    setViewing(true);
    try {
      const url = await getDocumentSignedUrl(row.document_type, row.file_url);
      if (!url) {
        toast.error("No se pudo generar el enlace del archivo.");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setViewing(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteDocument(row.document_type, row.source_id, row.file_url);
      toast.success("Documento eliminado.");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el documento.",
      );
      throw err;
    }
  }

  function handleReplaceSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startReplace(async () => {
      try {
        await replaceDocument(
          row.document_type,
          row.source_id,
          row.pet_id,
          row.file_url,
          formData,
        );
        toast.success("Documento reemplazado.");
        setReplaceOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "No se pudo reemplazar el documento.",
        );
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleView}
        disabled={viewing}
        aria-label="Ver documento"
      >
        {viewing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Eye className="size-4" />
        )}
      </Button>

      {canManage && (
        <>
          <Dialog open={replaceOpen} onOpenChange={setReplaceOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Reemplazar documento"
                />
              }
            >
              <Replace className="size-4" />
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay className="bg-black/70" />
              <DialogContent
                showCloseButton={false}
                className="max-w-md gap-0 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between">
                  <DialogTitle className="text-foreground text-xl font-bold">
                    Reemplazar documento
                  </DialogTitle>
                  <DialogClose className="text-muted-foreground hover:text-foreground">
                    <span className="sr-only">Cerrar</span>✕
                  </DialogClose>
                </div>
                <form
                  onSubmit={handleReplaceSubmit}
                  className="flex flex-col gap-4 pt-4"
                >
                  <p className="text-muted-foreground text-sm">
                    El archivo actual se elimina del almacenamiento y se
                    reemplaza por el nuevo.
                  </p>
                  <input
                    type="file"
                    name="file"
                    required
                    disabled={replacePending}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="file:bg-secondary text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <DialogClose
                      render={
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-10 rounded-full px-6"
                        />
                      }
                    >
                      Cancelar
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={replacePending}
                      className="h-10 rounded-full px-6"
                    >
                      {replacePending ? "Subiendo..." : "Reemplazar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </DialogPortal>
          </Dialog>

          <ConfirmDialog
            trigger={
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Eliminar documento"
                  />
                }
              >
                <Trash2 className="size-4" />
              </DialogTrigger>
            }
            title="Eliminar documento"
            description="El archivo se elimina de forma permanente del almacenamiento — esta acción no se puede deshacer."
            confirmLabel="Eliminar"
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  );
}
