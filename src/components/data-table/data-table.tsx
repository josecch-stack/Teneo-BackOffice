"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * First, last, current ±1 always shown; gaps collapse to a single "…" —
 * standard "1 2 3 … 9" pattern, never a wall of every page number.
 */
function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set(
    [1, 2, total - 1, total, current - 1, current, current + 1].filter(
      (p) => p >= 1 && p <= total,
    ),
  );
  const sorted = [...keep].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("gap");
    result.push(p);
    prev = p;
  }
  return result;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  pageCount: number;
  rowCount: number;
  emptyMessage?: string;
  /**
   * Extra context (e.g. a permission flag) a column's `cell` needs but that
   * can't be baked into the column definition at construction time — column
   * arrays must stay static, plain values (built once, module-level) since
   * they're defined in a "use client" file and rendered from a Server
   * Component; building them per-request on the server (a function call)
   * produces fresh functions that React can't serialize across that
   * boundary. Read via `table.options.meta` in a cell renderer instead.
   */
  meta?: Record<string, unknown>;
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
  meta,
}: DataTableProps<TData, TValue>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const table = useReactTable({
    data,
    columns,
    meta,
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const sortable =
                    header.column.columnDef.enableSorting !== false;
                  return (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground font-medium"
                    >
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
                            <ChevronsUpDown className="size-3" />
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

      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-1">
          {page > 1 ? (
            <Link
              href={hrefWithParam("page", String(page - 1))}
              className="text-primary px-2 py-1 font-medium hover:underline"
            >
              Anterior
            </Link>
          ) : (
            <span className="px-2 py-1 opacity-40">Anterior</span>
          )}
          {pageNumbers(page, Math.max(pageCount, 1)).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1.5">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={hrefWithParam("page", String(p))}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full tabular-nums",
                  p === page
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-primary/10 text-primary hover:bg-primary/20",
                )}
              >
                {p}
              </Link>
            ),
          )}
          {page < pageCount ? (
            <Link
              href={hrefWithParam("page", String(page + 1))}
              className="text-primary px-2 py-1 font-medium hover:underline"
            >
              Siguiente
            </Link>
          ) : (
            <span className="px-2 py-1 opacity-40">Siguiente</span>
          )}
        </div>
        <span>
          {rowCount} resultado{rowCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
