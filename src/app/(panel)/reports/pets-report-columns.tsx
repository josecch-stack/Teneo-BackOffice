"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDateCL } from "@/lib/utils/date";
import { SPECIES_OPTIONS } from "@/lib/validations/pet";

export interface PetReportRow {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  birth_date: string;
  is_sterilized: boolean | null;
  chip_number: string | null;
  created_at: string;
  owners: {
    first_name: string;
    last_name: string | null;
    regions: { name: string } | null;
  } | null;
}

const speciesLabel = (value: string) =>
  SPECIES_OPTIONS.find((s) => s.value === value)?.label ?? value;

export const petsReportColumns: ColumnDef<PetReportRow>[] = [
  {
    id: "name",
    header: "Mascota",
    enableSorting: false,
    cell: ({ row }) => row.original.name,
  },
  {
    id: "species",
    header: "Especie",
    enableSorting: false,
    cell: ({ row }) => speciesLabel(row.original.species),
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
    id: "region",
    header: "Región",
    enableSorting: false,
    cell: ({ row }) => row.original.owners?.regions?.name ?? "—",
  },
  {
    id: "sterilized",
    header: "Esterilizado",
    enableSorting: false,
    cell: ({ row }) => (row.original.is_sterilized ? "Sí" : "No"),
  },
  {
    id: "created_at",
    header: "Registrado",
    enableSorting: false,
    cell: ({ row }) => formatDateCL(row.original.created_at),
  },
];
