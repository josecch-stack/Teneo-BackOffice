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
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_OPTIONS,
  AUDIT_RESOURCE_LABELS,
} from "@/lib/utils/audit";
import type { AuditActorOption } from "./actions";

export function AuditFilters({ actors }: { actors: AuditActorOption[] }) {
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

  const actorLabel = Object.fromEntries(actors.map((a) => [a.id, a.label]));

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
        <Label>Actor</Label>
        <Select
          value={searchParams.get("actor") ?? ""}
          onValueChange={(v) => setParam("actor", v ?? "")}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todos">
              {(value: string) => actorLabel[value] ?? "Todos"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {actors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Acción</Label>
        <Select
          value={searchParams.get("action") ?? ""}
          onValueChange={(v) => setParam("action", v ?? "")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas">
              {(value: string) => AUDIT_ACTION_LABELS[value] ?? "Todas"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {AUDIT_ACTION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Recurso</Label>
        <Select
          value={searchParams.get("resource") ?? ""}
          onValueChange={(v) => setParam("resource", v ?? "")}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todos">
              {(value: string) => AUDIT_RESOURCE_LABELS[value] ?? "Todos"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {AUDIT_RESOURCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
