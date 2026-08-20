"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDateCL } from "@/lib/utils/date";
import { formatAge } from "@/lib/utils/age";
import { SPECIES_OPTIONS } from "@/lib/validations/pet";
import { InitialsAvatar } from "@/components/initials-avatar";

export interface PetRow {
  id: string;
  name: string;
  species: string;
  custom_species: string | null;
  breed: string | null;
  birth_date: string;
  chip_number: string | null;
  profile_photo_url: string | null;
  created_at: string;
  owners: {
    user_id: string;
    first_name: string;
    last_name: string | null;
  } | null;
}

const speciesLabel = (species: string, custom: string | null) =>
  species === "otro"
    ? custom || "Otro"
    : (SPECIES_OPTIONS.find((s) => s.value === species)?.label ?? species);

export const petColumns: ColumnDef<PetRow>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Mascota",
    cell: ({ row }) => (
      <Link
        href={`/pets/${row.original.id}`}
        className="flex items-center gap-3"
      >
        <InitialsAvatar
          name={row.original.name}
          imageUrl={row.original.profile_photo_url}
        />
        <span className="text-foreground font-bold">{row.original.name}</span>
      </Link>
    ),
  },
  {
    id: "species",
    header: "Especie",
    enableSorting: false,
    cell: ({ row }) =>
      speciesLabel(row.original.species, row.original.custom_species),
  },
  {
    id: "breed",
    header: "Raza",
    enableSorting: false,
    cell: ({ row }) => row.original.breed ?? "—",
  },
  {
    id: "birth_date",
    accessorKey: "birth_date",
    header: "Edad",
    cell: ({ row }) => formatAge(new Date(row.original.birth_date)),
  },
  {
    id: "chip_number",
    header: "Chip",
    enableSorting: false,
    cell: ({ row }) => row.original.chip_number ?? "—",
  },
  {
    id: "owner",
    header: "Tutor",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.owners ? (
        <Link
          href={`/owners/${row.original.owners.user_id}`}
          className="hover:underline"
        >
          {row.original.owners.first_name} {row.original.owners.last_name ?? ""}
        </Link>
      ) : (
        "—"
      ),
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Registrado",
    cell: ({ row }) => formatDateCL(row.original.created_at),
  },
];
