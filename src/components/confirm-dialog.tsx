"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** If set, the user must type this exact text before confirming — matches
   * the prompt's "acciones destructivas siempre con confirmación tipeada". */
  requireTypedConfirmation?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
}

/** Matches the Figma "Modal" reference (450:5544): dark overlay, 498px
 * rounded-2xl dialog, bold 24px title, right-aligned pill buttons. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  requireTypedConfirmation,
  onConfirm,
  destructive = true,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [typedValue, setTypedValue] = useState("");
  const [pending, setPending] = useState(false);

  const canConfirm =
    !requireTypedConfirmation || typedValue === requireTypedConfirmation;

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
      setTypedValue("");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogPortal>
        <DialogOverlay className="bg-black/70" />
        <DialogContent
          showCloseButton={false}
          className="max-w-[498px] gap-0 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            <DialogTitle className="text-foreground text-2xl leading-tight font-bold">
              {title}
            </DialogTitle>
            <DialogClose className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Cerrar</span>✕
            </DialogClose>
          </div>
          <p className="text-foreground py-4 text-base">{description}</p>
          {requireTypedConfirmation && (
            <div className="flex flex-col gap-2 pb-2">
              <Label htmlFor="confirm-text">
                Escribe{" "}
                <span className="font-mono">{requireTypedConfirmation}</span>{" "}
                para confirmar
              </Label>
              <Input
                id="confirm-text"
                value={typedValue}
                onChange={(e) => setTypedValue(e.target.value)}
                autoComplete="off"
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-6">
            <DialogClose
              render={
                <Button
                  variant="secondary"
                  className="h-12 rounded-full px-8"
                />
              }
            >
              {cancelLabel}
            </DialogClose>
            <Button
              variant={destructive ? "destructive" : "default"}
              className="h-12 rounded-full px-8"
              disabled={!canConfirm || pending}
              onClick={handleConfirm}
            >
              {pending ? "Eliminando..." : confirmLabel}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
