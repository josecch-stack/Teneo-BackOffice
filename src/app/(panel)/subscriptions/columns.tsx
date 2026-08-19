"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_BADGE_CLASS,
  SUBSCRIPTION_PAYMENT_METHOD_LABELS,
} from "@/lib/utils/subscription";
import { Badge } from "@/components/ui/badge";

export interface SubscriptionRow {
  id: string;
  plan_name: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  payment_method: string | null;
  owners: {
    first_name: string;
    last_name: string | null;
    email: string | null;
  } | null;
}

const fmt = (value: string | null) =>
  value ? format(new Date(value), "dd/MM/yyyy", { locale: es }) : "—";

export const subscriptionColumns: ColumnDef<SubscriptionRow>[] = [
  {
    id: "owner",
    header: "Tutor",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.owners ? (
        <span className="flex flex-col">
          <span className="text-foreground font-medium">
            {row.original.owners.first_name}{" "}
            {row.original.owners.last_name ?? ""}
          </span>
          {row.original.owners.email && (
            <span className="text-muted-foreground text-sm">
              {row.original.owners.email}
            </span>
          )}
        </span>
      ) : (
        "—"
      ),
  },
  {
    id: "plan_name",
    accessorKey: "plan_name",
    header: "Plan",
    cell: ({ row }) => row.original.plan_name,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <Badge
        className={SUBSCRIPTION_STATUS_BADGE_CLASS[row.original.status] ?? ""}
      >
        {SUBSCRIPTION_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    id: "payment_method",
    accessorKey: "payment_method",
    header: "Método de pago",
    cell: ({ row }) =>
      row.original.payment_method ? (
        <Badge variant="outline">
          {SUBSCRIPTION_PAYMENT_METHOD_LABELS[row.original.payment_method] ??
            row.original.payment_method}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "start_date",
    accessorKey: "start_date",
    header: "Inicio",
    cell: ({ row }) => fmt(row.original.start_date),
  },
  {
    id: "end_date",
    accessorKey: "end_date",
    header: "Fin",
    cell: ({ row }) => fmt(row.original.end_date),
  },
];
