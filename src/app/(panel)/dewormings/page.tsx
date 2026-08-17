import { listDewormings } from "./actions";
import { dewormingColumns, type DewormingRow } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { LinkButton } from "@/components/ui/link-button";

export default async function DewormingsPage(props: PageProps<"/dewormings">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Number(searchParams.page) || 1;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  const { rows, rowCount, pageCount } = await listDewormings({
    q,
    page,
    sort,
    dir,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Desparasitación</h1>
          <p className="text-muted-foreground text-sm">
            Registro de desparasitaciones aplicadas.
          </p>
        </div>
        <LinkButton href="/dewormings/new" className="rounded-full">
          Nueva desparasitación
        </LinkButton>
      </div>

      <DataTableSearch placeholder="Buscar por producto..." />

      <DataTable
        columns={dewormingColumns}
        data={rows as DewormingRow[]}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
        emptyMessage="No se encontraron registros de desparasitación."
      />
    </div>
  );
}
