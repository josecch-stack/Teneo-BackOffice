"use client";

import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
}

/** Small reference lookups (a few dozen to a few hundred rows) — client-side
 * filter over the already-fetched full list, no server pagination needed. */
export function CatalogList<T>({
  rows,
  columns,
  searchPlaceholder,
  filterFn,
  emptyMessage = "Sin resultados.",
}: {
  rows: T[];
  columns: Column<T>[];
  searchPlaceholder: string;
  filterFn: (row: T, query: string) => boolean;
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = query
    ? rows.filter((row) => filterFn(row, query.toLowerCase()))
    : rows;

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.header}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length ? (
              filtered.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.header}>{col.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground text-xs">
        {filtered.length} de {rows.length} resultados
      </p>
    </div>
  );
}
