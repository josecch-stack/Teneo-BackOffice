"use client";

import { auditColumns } from "./columns";
import type { AuditLogRow } from "./actions";
import { DataTable } from "@/components/data-table/data-table";

export function AuditTable({
  rows,
  page,
  pageCount,
  rowCount,
}: {
  rows: AuditLogRow[];
  page: number;
  pageCount: number;
  rowCount: number;
}) {
  return (
    <DataTable
      columns={auditColumns}
      data={rows}
      page={page}
      pageCount={pageCount}
      rowCount={rowCount}
      emptyMessage="No hay entradas de auditoría para estos filtros."
    />
  );
}
