"use client";

import { CatalogList } from "./catalog-list";

interface RegionRow {
  id: number;
  name: string;
  code: string;
  ordinal: number;
}

export function RegionsTable({ rows }: { rows: RegionRow[] }) {
  return (
    <CatalogList
      rows={rows}
      searchPlaceholder="Buscar región..."
      filterFn={(row, q) => row.name.toLowerCase().includes(q)}
      emptyMessage="Sin regiones."
      columns={[
        { header: "N°", cell: (row) => row.ordinal },
        { header: "Región", cell: (row) => row.name },
        { header: "Código", cell: (row) => row.code },
      ]}
    />
  );
}
