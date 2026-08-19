"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { AUDIT_ACTION_LABELS, AUDIT_RESOURCE_LABELS } from "@/lib/utils/audit";
import { ROLE_LABELS } from "@/lib/validations/panel-user";
import { AuditDetailDialog } from "./audit-detail-dialog";
import type { AuditLogRow } from "./actions";

const ACTION_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  export: "outline",
  view_file: "outline",
  replace: "secondary",
  send: "default",
  login: "outline",
  logout: "outline",
};

export const auditColumns: ColumnDef<AuditLogRow>[] = [
  {
    id: "created_at",
    header: "Fecha",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {format(new Date(row.original.created_at), "dd/MM/yyyy HH:mm", {
          locale: es,
        })}
      </span>
    ),
  },
  {
    id: "actor",
    header: "Actor",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.actor_email}</span>
        {row.original.actor_role && (
          <span className="text-muted-foreground text-xs">
            {ROLE_LABELS[row.original.actor_role] ?? row.original.actor_role}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "action",
    header: "Acción",
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant={ACTION_BADGE_VARIANT[row.original.action] ?? "outline"}>
        {AUDIT_ACTION_LABELS[row.original.action] ?? row.original.action}
      </Badge>
    ),
  },
  {
    id: "resource",
    header: "Recurso",
    enableSorting: false,
    cell: ({ row }) =>
      AUDIT_RESOURCE_LABELS[row.original.resource] ?? row.original.resource,
  },
  {
    id: "record_id",
    header: "ID de registro",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.record_id ?? "—"}
      </span>
    ),
  },
  {
    id: "ip_address",
    header: "IP",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.original.ip_address ?? "—"}
      </span>
    ),
  },
  {
    id: "detail",
    header: "",
    enableSorting: false,
    cell: ({ row }) => <AuditDetailDialog row={row.original} />,
  },
];
