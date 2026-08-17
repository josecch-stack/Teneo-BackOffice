"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  pageCount: number;
  rowCount: number;
  emptyMessage?: string;
}

/**
 * Server-driven table: pagination and sorting are URL search params
 * (?page=&sort=&dir=), not client state. The server component that renders
 * this passes only the already-fetched current page of rows — never the
 * full table.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  pageCount,
  rowCount,
  emptyMessage = "Sin resultados.",
}: DataTableProps<TData, TValue>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
  });

  function hrefWithParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    return `${pathname}?${params.toString()}`;
  }

  function sortHref(columnId: string) {
    const currentSort = searchParams.get("sort");
    const currentDir = searchParams.get("dir");
    const nextDir =
      currentSort === columnId && currentDir === "asc" ? "desc" : "asc";
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", columnId);
    params.set("dir", nextDir);
    params.set("page", "1");
    return `${pathname}?${params.toString()}`;
  }

  const currentSort = searchParams.get("sort");
  const currentDir = searchParams.get("dir") ?? "asc";

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortable =
                    header.column.columnDef.enableSorting !== false;
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : sortable ? (
                        <Link
                          href={sortHref(header.column.id)}
                          className="hover:text-foreground inline-flex items-center gap-1"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {currentSort === header.column.id ? (
                            <span className="text-xs">
                              {currentDir === "asc" ? "↑" : "↓"}
                            </span>
                          ) : (
                            <ChevronsUpDown className="text-muted-foreground size-3" />
                          )}
                        </Link>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
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

      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>
          {rowCount} resultado{rowCount === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Página {page} de {Math.max(pageCount, 1)}
          </span>
          {page > 1 ? (
            <Link
              href={hrefWithParam("page", String(page - 1))}
              aria-label="Página anterior"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
              )}
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              aria-label="Página anterior"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
              )}
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          {page < pageCount ? (
            <Link
              href={hrefWithParam("page", String(page + 1))}
              aria-label="Página siguiente"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
              )}
            >
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              aria-label="Página siguiente"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
              )}
            >
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
