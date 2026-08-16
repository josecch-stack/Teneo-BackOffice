"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegionFilter({
  regions,
}: {
  regions: { id: number; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("region") ?? "";

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set("region", value);
        else params.delete("region");
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Todas las regiones" />
      </SelectTrigger>
      <SelectContent>
        {regions.map((region) => (
          <SelectItem key={region.id} value={region.id.toString()}>
            {region.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
