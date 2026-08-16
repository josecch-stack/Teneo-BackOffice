"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePanelUserRole } from "./actions";
import { PANEL_ROLE_OPTIONS, ROLE_LABELS } from "@/lib/validations/panel-user";
import type { PanelRole } from "@/lib/auth/dal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PanelUserRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: PanelRole;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(value: string | null) {
    if (!value || value === role) return;
    startTransition(async () => {
      try {
        await updatePanelUserRole(userId, value as PanelRole);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "No se pudo actualizar el rol.",
        );
      }
    });
  }

  return (
    <Select
      value={role}
      onValueChange={handleChange}
      disabled={disabled || pending}
    >
      <SelectTrigger size="sm" className="w-[190px]">
        <SelectValue>{(value: PanelRole) => ROLE_LABELS[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PANEL_ROLE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
