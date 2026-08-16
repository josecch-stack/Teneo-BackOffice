"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { togglePanelUserActive } from "./actions";
import { Badge } from "@/components/ui/badge";

export function PanelUserActiveToggle({
  userId,
  active,
  disabled,
}: {
  userId: string;
  active: boolean;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startTransition(async () => {
      try {
        await togglePanelUserActive(userId, !active);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el estado.",
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || pending}
      className="disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Badge
        variant={active ? "default" : "outline"}
        className={
          active ? "bg-primary/10 text-primary" : "text-muted-foreground"
        }
      >
        {active ? "Activo" : "Inactivo"}
      </Badge>
    </button>
  );
}
