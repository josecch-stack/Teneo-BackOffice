"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setOwnerPremium } from "./actions";
import { Checkbox } from "@/components/ui/checkbox";

export function PremiumToggle({
  userId,
  premium,
  disabled,
}: {
  userId: string;
  premium: boolean;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      try {
        await setOwnerPremium(userId, checked);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "No se pudo actualizar Premium.",
        );
      }
    });
  }

  return (
    <Checkbox
      checked={premium}
      disabled={disabled || pending}
      onCheckedChange={handleChange}
      aria-label={premium ? "Quitar Premium" : "Otorgar Premium"}
    />
  );
}
