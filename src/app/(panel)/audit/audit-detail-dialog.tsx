"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AuditLogRow } from "./actions";

function Diff({ label, values }: { label: string; values: unknown }) {
  if (values === null || values === undefined) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-bold uppercase">
        {label}
      </span>
      <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
        {JSON.stringify(values, null, 2)}
      </pre>
    </div>
  );
}

export function AuditDetailDialog({ row }: { row: AuditLogRow }) {
  const hasDetail = row.old_values !== null || row.new_values !== null;

  if (!hasDetail) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Ver detalle
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del registro</DialogTitle>
          <DialogDescription>
            {row.record_id
              ? `ID: ${row.record_id}`
              : "Sin ID de registro asociado."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
          <Diff label="Antes" values={row.old_values} />
          <Diff label="Después" values={row.new_values} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
