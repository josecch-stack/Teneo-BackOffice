import { listPets } from "./actions";
import { petColumns, type PetRow } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { LinkButton } from "@/components/ui/link-button";

export default async function PetsPage(props: PageProps<"/pets">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Number(searchParams.page) || 1;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  const { rows, rowCount, pageCount } = await listPets({ q, page, sort, dir });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Mascotas</h1>
          <p className="text-muted-foreground text-sm">
            Fichas de mascotas registradas.
          </p>
        </div>
        <LinkButton href="/pets/new" className="rounded-full">
          Nueva mascota
        </LinkButton>
      </div>

      <DataTableSearch placeholder="Buscar por nombre o N° de chip..." />

      <DataTable
        columns={petColumns}
        data={rows as PetRow[]}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
        emptyMessage="No se encontraron mascotas."
      />
    </div>
  );
}
