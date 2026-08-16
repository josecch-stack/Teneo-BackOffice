"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NextDoseBadge } from "@/components/next-dose-badge";

export interface DewormingRow {
  id: string;
  type: string;
  product: string;
  application_date: string;
  next_dose_date: string | null;
  pets: {
    id: string;
    name: string;
    owners: { first_name: string; last_name: string | null } | null;
  } | null;
}

const TYPE_LABELS: Record<string, string> = {
  interna: "Interna",
  externa: "Externa",
  mixta: "Mixta",
};

export const dewormingColumns: ColumnDef<DewormingRow>[] = [
  {
    id: "product",
    accessorKey: "product",
    header: "Producto",
    cell: ({ row }) => (
      <Link
        href={`/dewormings/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.product}
      </Link>
    ),
  },
  {
    id: "pet",
    header: "Mascota",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.pets ? (
        <Link
          href={`/pets/${row.original.pets.id}`}
          className="hover:underline"
        >
          {row.original.pets.name}
        </Link>
      ) : (
        "—"
      ),
  },
  {
    id: "type",
    header: "Tipo",
    enableSorting: false,
    cell: ({ row }) => TYPE_LABELS[row.original.type] ?? row.original.type,
  },
  {
    id: "application_date",
    accessorKey: "application_date",
    header: "Aplicación",
    cell: ({ row }) =>
      format(new Date(row.original.application_date), "dd/MM/yyyy", {
        locale: es,
      }),
  },
  {
    id: "next_dose_date",
    accessorKey: "next_dose_date",
    header: "Próxima dosis",
    cell: ({ row }) => (
      <NextDoseBadge nextDoseDate={row.original.next_dose_date} />
    ),
  },
];
