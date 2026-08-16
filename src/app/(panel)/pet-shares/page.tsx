import { listPetShares } from "./actions";
import { petShareColumns, type PetShareRow } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";

export default async function PetSharesPage(props: PageProps<"/pet-shares">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Number(searchParams.page) || 1;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  const { rows, rowCount, pageCount } = await listPetShares({
    q,
    page,
    sort,
    dir,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Compartir mascota</h1>
        <p className="text-muted-foreground text-sm">
          Invitaciones que un tutor envía a otra persona para compartir el
          acceso a una mascota desde la app.
        </p>
      </div>

      <DataTableSearch placeholder="Buscar por correo invitado..." />

      <DataTable
        columns={petShareColumns}
        data={rows as PetShareRow[]}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
        emptyMessage="No hay mascotas compartidas."
      />
    </div>
  );
}
