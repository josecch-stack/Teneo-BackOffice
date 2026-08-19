"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/utils/subscription";

export interface OwnerReportRow {
  user_id: string;
  first_name: string;
  last_name: string | null;
  rut: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  regions: { name: string } | null;
  communes: { name: string } | null;
  pets: { count: number }[] | null;
  // subscriptions.owner_id is UNIQUE — at most one per owner, embedded as a
  // single object, not an array.
  subscriptions: { status: string } | null;
}

export const ownersReportColumns: ColumnDef<OwnerReportRow>[] = [
  {
    id: "name",
    header: "Tutor",
    enableSorting: false,
    cell: ({ row }) =>
      `${row.original.first_name} ${row.original.last_name ?? ""}`.trim(),
  },
  {
    id: "rut",
    header: "RUT",
    enableSorting: false,
    cell: ({ row }) => row.original.rut ?? "—",
  },
  {
    id: "region",
    header: "Región",
    enableSorting: false,
    cell: ({ row }) => row.original.regions?.name ?? "—",
  },
  {
    id: "pet_count",
    header: "Mascotas",
    enableSorting: false,
    cell: ({ row }) => row.original.pets?.[0]?.count ?? 0,
  },
  {
    id: "subscription",
    header: "Suscripción",
    enableSorting: false,
    cell: ({ row }) => {
      const status = row.original.subscriptions?.status;
      return status
        ? (SUBSCRIPTION_STATUS_LABELS[status] ?? status)
        : "Sin suscripción";
    },
  },
  {
    id: "created_at",
    header: "Registrado",
    enableSorting: false,
    cell: ({ row }) =>
      format(new Date(row.original.created_at), "dd/MM/yyyy", { locale: es }),
  },
];
