"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EXAM_CATEGORY_LABELS } from "@/lib/validations/exam";

export interface LabExamRow {
  id: string;
  exam_name: string;
  category: string;
  sample_date: string | null;
  result_date: string;
  lab_center: string | null;
  pets: {
    id: string;
    name: string;
    owners: { first_name: string; last_name: string | null } | null;
  } | null;
}

export const labExamColumns: ColumnDef<LabExamRow>[] = [
  {
    id: "exam_name",
    accessorKey: "exam_name",
    header: "Examen",
    cell: ({ row }) => (
      <Link
        href={`/exams/lab/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.exam_name}
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
    id: "category",
    header: "Categoría",
    enableSorting: false,
    cell: ({ row }) =>
      EXAM_CATEGORY_LABELS[row.original.category] ?? row.original.category,
  },
  {
    id: "result_date",
    accessorKey: "result_date",
    header: "Resultado",
    cell: ({ row }) =>
      format(new Date(row.original.result_date), "dd/MM/yyyy", { locale: es }),
  },
  {
    id: "lab_center",
    header: "Laboratorio",
    enableSorting: false,
    cell: ({ row }) => row.original.lab_center ?? "—",
  },
];
