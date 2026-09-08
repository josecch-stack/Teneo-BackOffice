"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDateCL } from "@/lib/utils/date";
import { NextDoseBadge } from "@/components/next-dose-badge";

export interface VaccineRow {
  id: string;
  vaccine_name: string;
  application_type: string | null;
  application_date: string | null;
  next_dose_date: string | null;
  status: string | null;
  brand_lab: string | null;
  vet_center: string | null;
  pets: {
    id: string;
    name: string;
    species: string;
    owners: { first_name: string; last_name: string | null } | null;
  } | null;
}

export const vaccineColumns: ColumnDef<VaccineRow>[] = [
  {
    id: "vaccine_name",
    accessorKey: "vaccine_name",
    header: "Vacuna",
    cell: ({ row }) => (
      <Link
        href={`/vaccines/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.vaccine_name}
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
    id: "application_type",
    header: "Tipo",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.application_type === "refuerzo"
        ? "Refuerzo"
        : row.original.application_type === "anual"
          ? "Anual"
          : "—",
  },
  {
    id: "application_date",
    accessorKey: "application_date",
    header: "Aplicación",
    cell: ({ row }) =>
      row.original.application_date
        ? formatDateCL(row.original.application_date)
        : "—",
  },
  {
    id: "next_dose_date",
    accessorKey: "next_dose_date",
    header: "Próxima dosis",
    cell: ({ row }) => (
      <NextDoseBadge
        status={row.original.status}
        applicationDate={row.original.application_date}
        nextDoseDate={row.original.next_dose_date}
      />
    ),
  },
  {
    id: "brand_lab",
    header: "Marca/Lab",
    enableSorting: false,
    cell: ({ row }) => row.original.brand_lab ?? "—",
  },
];
