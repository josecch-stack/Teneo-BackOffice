import { listClinicalNotes } from "./actions";
import { clinicalNoteColumns, type ClinicalNoteRow } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { LinkButton } from "@/components/ui/link-button";

export default async function ClinicalNotesPage(
  props: PageProps<"/clinical-notes">,
) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Number(searchParams.page) || 1;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  const { rows, rowCount, pageCount } = await listClinicalNotes({
    q,
    page,
    sort,
    dir,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notas clínicas</h1>
          <p className="text-muted-foreground text-sm">
            Consultas, cirugías y recetas registradas.
          </p>
        </div>
        <LinkButton href="/clinical-notes/new" className="rounded-full">
          Nueva nota clínica
        </LinkButton>
      </div>

      <DataTableSearch placeholder="Buscar por motivo..." />

      <DataTable
        columns={clinicalNoteColumns}
        data={rows as ClinicalNoteRow[]}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
        emptyMessage="No se encontraron notas clínicas."
      />
    </div>
  );
}
