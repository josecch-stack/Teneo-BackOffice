"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CLINICAL_EVENT_TYPE_LABELS } from "@/lib/validations/clinical-note";
import { Badge } from "@/components/ui/badge";

export interface ClinicalNoteRow {
  id: string;
  event_type: string | null;
  event_date: string;
  reason: string | null;
  veterinarian: string | null;
  has_prescription: boolean | null;
  pets: {
    id: string;
    name: string;
    owners: { first_name: string; last_name: string | null } | null;
  } | null;
}

export const clinicalNoteColumns: ColumnDef<ClinicalNoteRow>[] = [
  {
    id: "event_date",
    accessorKey: "event_date",
    header: "Fecha",
    cell: ({ row }) =>
      format(new Date(row.original.event_date), "dd/MM/yyyy", { locale: es }),
  },
  {
    id: "pet",
    header: "Mascota",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.pets ? (
        <Link
          href={`/clinical-notes/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.pets.name}
        </Link>
      ) : (
        "—"
      ),
  },
  {
    id: "owner",
    header: "Tutor",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.pets?.owners
        ? `${row.original.pets.owners.first_name} ${row.original.pets.owners.last_name ?? ""}`
        : "—",
  },
  {
    id: "event_type",
    header: "Tipo",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.event_type
        ? CLINICAL_EVENT_TYPE_LABELS[row.original.event_type]
        : "—",
  },
  {
    id: "reason",
    header: "Motivo",
    enableSorting: false,
    cell: ({ row }) => row.original.reason ?? "—",
  },
  {
    id: "veterinarian",
    header: "Veterinario",
    enableSorting: false,
    cell: ({ row }) => row.original.veterinarian ?? "—",
  },
  {
    id: "has_prescription",
    header: "Receta",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.has_prescription ? (
        <Badge className="bg-primary/10 text-primary">Sí</Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          No
        </Badge>
      ),
  },
];
