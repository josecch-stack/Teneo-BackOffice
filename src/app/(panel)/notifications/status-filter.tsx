"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_LABELS: Record<string, string> = {
  sent: "Enviadas",
  pending: "Pendientes",
};

export function StatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "";

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set("status", value);
        else params.delete("status");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Todos los estados">
          {(value: string) => STATUS_LABELS[value] ?? "Todos los estados"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="sent">Enviadas</SelectItem>
        <SelectItem value="pending">Pendientes</SelectItem>
      </SelectContent>
    </Select>
  );
}
