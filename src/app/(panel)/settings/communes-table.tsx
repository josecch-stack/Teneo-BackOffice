"use client";

import { CatalogList } from "./catalog-list";

interface CommuneRow {
  id: number;
  name: string;
  regions: { name: string } | null;
}

export function CommunesTable({ rows }: { rows: CommuneRow[] }) {
  return (
    <CatalogList
      rows={rows}
      searchPlaceholder="Buscar comuna..."
      filterFn={(row, q) =>
        row.name.toLowerCase().includes(q) ||
        (row.regions?.name.toLowerCase().includes(q) ?? false)
      }
      emptyMessage="Sin comunas."
      columns={[
        { header: "Comuna", cell: (row) => row.name },
        { header: "Región", cell: (row) => row.regions?.name ?? "—" },
      ]}
    />
  );
}
