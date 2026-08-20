"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDateCL } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";

export interface PetShareRow {
  id: string;
  shared_with_email: string;
  accepted: boolean | null;
  created_at: string;
  pets: { id: string; name: string } | null;
  sharer: { first_name: string; last_name: string | null } | null;
}

export const petShareColumns: ColumnDef<PetShareRow>[] = [
  {
    id: "pet",
    header: "Mascota",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.pets ? (
        <Link
          href={`/pets/${row.original.pets.id}`}
          className="font-medium hover:underline"
        >
          {row.original.pets.name}
        </Link>
      ) : (
        "—"
      ),
  },
  {
    id: "sharer",
    header: "Compartido por",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.sharer
        ? `${row.original.sharer.first_name} ${row.original.sharer.last_name ?? ""}`
        : "—",
  },
  {
    id: "shared_with_email",
    header: "Compartido con",
    enableSorting: false,
    cell: ({ row }) => row.original.shared_with_email,
  },
  {
    id: "accepted",
    accessorKey: "accepted",
    header: "Estado",
    cell: ({ row }) =>
      row.original.accepted ? (
        <Badge className="bg-emerald-500/10 text-emerald-600">Aceptado</Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Pendiente
        </Badge>
      ),
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Invitado el",
    cell: ({ row }) => formatDateCL(row.original.created_at),
  },
];
