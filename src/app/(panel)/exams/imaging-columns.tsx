"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDateCL } from "@/lib/utils/date";
import { IMAGING_TYPE_LABELS } from "@/lib/validations/exam";

export interface ImagingExamRow {
  id: string;
  image_type: string;
  body_region: string | null;
  exam_date: string;
  vet_center: string | null;
  pets: {
    id: string;
    name: string;
    owners: { first_name: string; last_name: string | null } | null;
  } | null;
}

export const imagingExamColumns: ColumnDef<ImagingExamRow>[] = [
  {
    id: "image_type",
    accessorKey: "image_type",
    header: "Tipo",
    cell: ({ row }) => (
      <Link
        href={`/exams/imaging/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {IMAGING_TYPE_LABELS[row.original.image_type] ??
          row.original.image_type}
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
    id: "owner",
    header: "Tutor",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.pets?.owners
        ? `${row.original.pets.owners.first_name} ${row.original.pets.owners.last_name ?? ""}`
        : "—",
  },
  {
    id: "body_region",
    header: "Zona",
    enableSorting: false,
    cell: ({ row }) => row.original.body_region ?? "—",
  },
  {
    id: "exam_date",
    accessorKey: "exam_date",
    header: "Fecha",
    cell: ({ row }) => formatDateCL(row.original.exam_date),
  },
  {
    id: "vet_center",
    header: "Centro veterinario",
    enableSorting: false,
    cell: ({ row }) => row.original.vet_center ?? "—",
  },
];
