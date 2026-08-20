"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDateTimeCL } from "@/lib/utils/date";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/utils/notification";
import { Badge } from "@/components/ui/badge";

export interface NotificationRow {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  trigger_date: string;
  sent_at: string | null;
  is_read: boolean | null;
  pets: { name: string } | null;
  owners: { first_name: string; last_name: string | null } | null;
}

export const notificationColumns: ColumnDef<NotificationRow>[] = [
  {
    id: "notification_type",
    header: "Tipo",
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant="outline">
        {NOTIFICATION_TYPE_LABELS[row.original.notification_type] ??
          row.original.notification_type}
      </Badge>
    ),
  },
  {
    id: "title",
    header: "Notificación",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="flex flex-col">
        <span className="text-foreground font-medium">
          {row.original.title}
        </span>
        <span className="text-muted-foreground text-sm">
          {row.original.message}
        </span>
      </span>
    ),
  },
  {
    id: "pet",
    header: "Mascota",
    enableSorting: false,
    cell: ({ row }) => row.original.pets?.name ?? "—",
  },
  {
    id: "owner",
    header: "Tutor",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.owners
        ? `${row.original.owners.first_name} ${row.original.owners.last_name ?? ""}`
        : "—",
  },
  {
    id: "trigger_date",
    header: "Fecha",
    enableSorting: false,
    cell: ({ row }) => formatDateTimeCL(row.original.trigger_date),
  },
  {
    id: "status",
    header: "Estado",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.sent_at ? (
        <Badge className="bg-emerald-500/10 text-emerald-600">Enviada</Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Pendiente
        </Badge>
      ),
  },
];
