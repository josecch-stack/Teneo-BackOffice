"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPECIES_OPTIONS } from "@/lib/validations/pet";
import { SUBSCRIPTION_STATUS_OPTIONS } from "@/lib/utils/subscription";

export function ReportFilters({
  tab,
  regions,
}: {
  tab: "owners" | "pets";
  regions: { id: number; name: string }[];
}) {
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
      <div className="flex flex-col gap-2">
        <Label>Región</Label>
        <Select
          value={searchParams.get("region") ?? ""}
          onValueChange={(v) => setParam("region", v ?? "")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las regiones" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((r) => (
              <SelectItem key={r.id} value={r.id.toString()}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {tab === "pets" ? (
        <div className="flex flex-col gap-2">
          <Label>Especie</Label>
          <Select
            value={searchParams.get("species") ?? ""}
            onValueChange={(v) => setParam("species", v ?? "")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              {SPECIES_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label>Suscripción</Label>
          <Select
            value={searchParams.get("subscription") ?? ""}
            onValueChange={(v) => setParam("subscription", v ?? "")}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              {SUBSCRIPTION_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
