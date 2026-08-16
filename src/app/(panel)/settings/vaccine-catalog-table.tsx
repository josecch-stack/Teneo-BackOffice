"use client";

import { CatalogList } from "./catalog-list";
import { SPECIES_OPTIONS } from "@/lib/validations/pet";

interface VaccineCatalogRow {
  id: number;
  name: string;
  species: string | null;
  description: string | null;
}

const speciesLabel = (value: string | null) =>
  SPECIES_OPTIONS.find((s) => s.value === value)?.label ?? "Todas";

export function VaccineCatalogTable({ rows }: { rows: VaccineCatalogRow[] }) {
  return (
    <CatalogList
      rows={rows}
      searchPlaceholder="Buscar vacuna..."
      filterFn={(row, q) => row.name.toLowerCase().includes(q)}
      emptyMessage="Sin vacunas en el catálogo."
      columns={[
        { header: "Nombre", cell: (row) => row.name },
        { header: "Especie", cell: (row) => speciesLabel(row.species) },
        { header: "Descripción", cell: (row) => row.description ?? "—" },
      ]}
    />
  );
}
