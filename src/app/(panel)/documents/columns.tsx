"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDateCL } from "@/lib/utils/date";
import { DOCUMENT_TYPE_LABELS } from "@/lib/utils/document";
import { Badge } from "@/components/ui/badge";
import { DocumentRowActions } from "./document-row-actions";
import type { DocumentRow } from "./actions";

export function createDocumentColumns(
  canManage: boolean,
): ColumnDef<DocumentRow>[] {
  return [
    {
      id: "document_type",
      header: "Tipo",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="outline">
          {DOCUMENT_TYPE_LABELS[row.original.document_type] ??
            row.original.document_type}
        </Badge>
      ),
    },
    {
      id: "pet",
      header: "Mascota",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/pets/${row.original.pet_id}`}
          className="font-medium hover:underline"
        >
          {row.original.pet_name}
        </Link>
      ),
    },
    {
      id: "owner",
      header: "Tutor",
      enableSorting: false,
      cell: ({ row }) =>
        `${row.original.owner_first_name} ${row.original.owner_last_name ?? ""}`.trim(),
    },
    {
      id: "file_name",
      header: "Archivo",
      enableSorting: false,
      cell: ({ row }) => row.original.file_name ?? "—",
    },
    {
      id: "created_at",
      header: "Fecha",
      enableSorting: false,
      cell: ({ row }) => formatDateCL(row.original.created_at),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <DocumentRowActions row={row.original} canManage={canManage} />
      ),
    },
  ];
}
