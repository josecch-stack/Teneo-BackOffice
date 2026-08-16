"use client";

import { CatalogList } from "./catalog-list";

interface LabCatalogRow {
  id: number;
  name: string;
}

export function LabCatalogTable({ rows }: { rows: LabCatalogRow[] }) {
  return (
    <CatalogList
      rows={rows}
      searchPlaceholder="Buscar laboratorio..."
      filterFn={(row, q) => row.name.toLowerCase().includes(q)}
      emptyMessage="Sin laboratorios en el catálogo."
      columns={[{ header: "Nombre", cell: (row) => row.name }]}
    />
  );
}
