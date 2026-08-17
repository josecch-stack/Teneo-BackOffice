"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  DOCUMENT_TYPE_OPTIONS,
  DOCUMENT_TYPE_LABELS,
} from "@/lib/utils/document";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DocumentTypeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("type") ?? "";

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set("type", value);
        else params.delete("type");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Todos los tipos">
          {(value: string) => DOCUMENT_TYPE_LABELS[value] ?? "Todos los tipos"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {DOCUMENT_TYPE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
