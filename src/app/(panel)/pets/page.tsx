import { listPets } from "./actions";
import { petColumns, type PetRow } from "./columns";
import { verifySession, hasPermission } from "@/lib/auth/dal";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DateRangeFilter } from "@/components/data-table/date-range-filter";
import { TabLinks } from "@/components/data-table/tab-links";
import { ExportMenu } from "@/components/data-table/export-menu";
import { LinkButton } from "@/components/ui/link-button";

const SPECIES_TABS = [
  { value: "all", label: "Todos" },
  { value: "perro", label: "Perro" },
  { value: "gato", label: "Gato" },
  { value: "conejo,ave,reptil,otro", label: "Otros" },
];

export default async function PetsPage(props: PageProps<"/pets">) {
  const session = await verifySession();
  const canExport = hasPermission(session, "export:bulk");

  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Number(searchParams.page) || 1;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const from =
    typeof searchParams.from === "string" ? searchParams.from : undefined;
  const to = typeof searchParams.to === "string" ? searchParams.to : undefined;
  const species =
    typeof searchParams.species === "string" ? searchParams.species : "all";

  const { rows, rowCount, pageCount } = await listPets({
    q,
    page,
    sort,
    dir,
    from,
    to,
    species: species === "all" ? undefined : species,
  });

  const exportParams = new URLSearchParams({ type: "pets" });
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);
  if (species !== "all") exportParams.set("species", species);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Mascotas</h1>
          <p className="text-muted-foreground text-sm">
            Fichas de mascotas registradas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canExport && (
            <ExportMenu
              csvHref={`/reports/export?${exportParams.toString()}&format=csv`}
              xlsxHref={`/reports/export?${exportParams.toString()}&format=xlsx`}
            />
          )}
          <LinkButton href="/pets/new" className="rounded-full">
            Nueva mascota
          </LinkButton>
        </div>
      </div>

      <TabLinks param="species" options={SPECIES_TABS} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <DataTableSearch placeholder="Buscar por nombre o N° de chip..." />
        <DateRangeFilter />
      </div>

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
