import { listVaccines } from "./actions";
import { vaccineColumns, type VaccineRow } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { LinkButton } from "@/components/ui/link-button";

export default async function VaccinesPage(props: PageProps<"/vaccines">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Number(searchParams.page) || 1;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  const { rows, rowCount, pageCount } = await listVaccines({
    q,
    page,
    sort,
    dir,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Vacunas</h1>
          <p className="text-muted-foreground text-sm">
            Registro de vacunas aplicadas.
          </p>
        </div>
        <LinkButton href="/vaccines/new" className="rounded-full">
          Nueva vacuna
        </LinkButton>
      </div>

      <DataTableSearch placeholder="Buscar por nombre de vacuna..." />

      <DataTable
        columns={vaccineColumns}
        data={rows as VaccineRow[]}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
        emptyMessage="No se encontraron vacunas."
      />
    </div>
  );
}
