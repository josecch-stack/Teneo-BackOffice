"use client";

import { createDocumentColumns } from "./columns";
import type { DocumentRow } from "./actions";
import { DataTable } from "@/components/data-table/data-table";

export function DocumentsTable({
  rows,
  page,
  pageCount,
  rowCount,
  canManage,
}: {
  rows: DocumentRow[];
  page: number;
  pageCount: number;
  rowCount: number;
  canManage: boolean;
}) {
  const columns = createDocumentColumns(canManage);

  return (
    <DataTable
      columns={columns}
      data={rows}
      page={page}
      pageCount={pageCount}
      rowCount={rowCount}
      emptyMessage="No se encontraron documentos."
    />
  );
}
