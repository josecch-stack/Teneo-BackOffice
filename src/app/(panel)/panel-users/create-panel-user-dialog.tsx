"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPanelUser } from "./actions";
import { PANEL_ROLE_OPTIONS, ROLE_LABELS } from "@/lib/validations/panel-user";
import type { PanelRole } from "@/lib/auth/dal";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreatePanelUserDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const result = await createPanelUser({}, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Usuario de panel creado.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-12 rounded-full px-6" />}>
        Nuevo usuario
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="bg-black/70" />
        <DialogContent
          showCloseButton={false}
          className="max-w-[498px] gap-0 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            <DialogTitle className="text-foreground text-2xl leading-tight font-bold">
              Nuevo usuario de panel
            </DialogTitle>
            <DialogClose className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Cerrar</span>✕
            </DialogClose>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                name="full_name"
                required
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña temporal</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Rol</Label>
              <Select name="role" defaultValue="viewer" disabled={pending}>
                <SelectTrigger id="role">
                  <SelectValue>
                    {(value: PanelRole) => ROLE_LABELS[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PANEL_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {pending ? "Creando..." : "Crear usuario"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
