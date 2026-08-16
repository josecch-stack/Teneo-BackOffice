"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { sendManualNotification } from "./actions";
import { PetPicker } from "@/components/pet-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ComposeNotificationDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const result = await sendManualNotification({}, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Notificación enviada.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-12 rounded-full px-6" />}>
        Nueva notificación
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="bg-black/70" />
        <DialogContent
          showCloseButton={false}
          className="max-w-[498px] gap-0 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            <DialogTitle className="text-foreground text-2xl leading-tight font-bold">
              Nueva notificación manual
            </DialogTitle>
            <DialogClose className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Cerrar</span>✕
            </DialogClose>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
            <PetPicker disabled={pending} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required disabled={pending} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                name="message"
                required
                disabled={pending}
              />
            </div>

            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-12 rounded-full px-8"
                  />
                }
              >
                Cancelar
              </DialogClose>
              <Button
                type="submit"
                disabled={pending}
                className="h-12 rounded-full px-8"
              >
                {pending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
