import { listOwners } from "./actions";
import { ownerColumns, type OwnerRow } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";

export default async function OwnersPage(props: PageProps<"/owners">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Number(searchParams.page) || 1;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  const { rows, rowCount, pageCount } = await listOwners({
    q,
    page,
    sort,
    dir,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tutores</h1>
          <p className="text-muted-foreground text-sm">
            Propietarios registrados en la app móvil.
          </p>
        </div>
      </div>

      <DataTableSearch placeholder="Buscar por nombre, RUT, correo o teléfono..." />

      <DataTable
        columns={ownerColumns}
        data={rows as OwnerRow[]}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
        emptyMessage="No se encontraron tutores."
      />
    </div>
  );
}
