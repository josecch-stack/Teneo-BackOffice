import { listDocuments, type DocumentType } from "./actions";
import { DocumentsTable } from "./documents-table";
import { DocumentTypeFilter } from "./document-type-filter";
import { verifySession, hasPermission } from "@/lib/auth/dal";
import { DataTableSearch } from "@/components/data-table/data-table-search";

export default async function DocumentsPage(props: PageProps<"/documents">) {
  const session = await verifySession();
  const canManage = hasPermission(session, "document:manage");

  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const documentType =
    typeof searchParams.type === "string"
      ? (searchParams.type as DocumentType)
      : undefined;
  const page = Number(searchParams.page) || 1;

  const { rows, rowCount, pageCount } = await listDocuments({
    q,
    documentType,
    page,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Documentos</h1>
        <p className="text-muted-foreground text-sm">
          Certificados de chip, comprobantes de vacuna, recetas y archivos de
          examen subidos desde la app.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch placeholder="Buscar por mascota, tutor o archivo..." />
        <DocumentTypeFilter />
      </div>

      <DocumentsTable
        rows={rows}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
        canManage={canManage}
      />
    </div>
  );
}
