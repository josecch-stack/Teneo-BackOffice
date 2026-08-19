"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="from">Desde</Label>
        <Input
          id="from"
          type="date"
          defaultValue={searchParams.get("from") ?? ""}
          onChange={(e) => setParam("from", e.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="to">Hasta</Label>
        <Input
          id="to"
          type="date"
          defaultValue={searchParams.get("to") ?? ""}
          onChange={(e) => setParam("to", e.target.value)}
          className="w-40"
        />
      </div>
    </div>
  );
}
