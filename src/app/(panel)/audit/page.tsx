import { requirePermission } from "@/lib/auth/dal";
import { listAuditLog, listAuditActors } from "./actions";
import { AuditFilters } from "./audit-filters";
import { AuditTable } from "./audit-table";

export default async function AuditPage(props: PageProps<"/audit">) {
  // Sensitive by nature (who did what, to what, and when) — gate the whole
  // page on one permission rather than per-section, same pattern as
  // /settings. Only super_admin/admin carry audit:read (see
  // docs/migrations-propuestas.md Propuesta 1) — RLS on audit_log enforces
  // the same check independently, so this is defense in depth, not the only
  // thing standing between a lower role and this data.
  await requirePermission("audit:read");

  const searchParams = await props.searchParams;
  const action =
    typeof searchParams.action === "string" ? searchParams.action : undefined;
  const resource =
    typeof searchParams.resource === "string"
      ? searchParams.resource
      : undefined;
  const actorId =
    typeof searchParams.actor === "string" ? searchParams.actor : undefined;
  const from =
    typeof searchParams.from === "string" ? searchParams.from : undefined;
  const to = typeof searchParams.to === "string" ? searchParams.to : undefined;
  const page = Number(searchParams.page) || 1;

  const [{ rows, rowCount, pageCount }, actors] = await Promise.all([
    listAuditLog({ action, resource, actorId, from, to, page }),
    listAuditActors(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Auditoría</h1>
        <p className="text-muted-foreground text-sm">
          Registro inmutable de cada creación, edición, eliminación, exportación
          y acceso a archivos clínicos hecho desde el panel.
        </p>
      </div>

      <AuditFilters actors={actors} />

      <AuditTable
        rows={rows}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
      />
    </div>
  );
}
