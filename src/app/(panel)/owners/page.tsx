import { listOwners } from "./actions";
import { getOwnerColumns, type OwnerRow } from "./columns";
import { verifySession, hasPermission } from "@/lib/auth/dal";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DateRangeFilter } from "@/components/data-table/date-range-filter";
import { TabLinks } from "@/components/data-table/tab-links";
import { ExportMenu } from "@/components/data-table/export-menu";

const PLAN_TABS = [
  { value: "all", label: "Todos" },
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
];

export default async function OwnersPage(props: PageProps<"/owners">) {
  const session = await verifySession();
  const canExport = hasPermission(session, "export:bulk");
  const canWritePremium = hasPermission(session, "subscription:write");

  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Number(searchParams.page) || 1;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const from =
    typeof searchParams.from === "string" ? searchParams.from : undefined;
  const to = typeof searchParams.to === "string" ? searchParams.to : undefined;
  const plan =
    typeof searchParams.plan === "string" ? searchParams.plan : "all";

  const { rows, rowCount, pageCount } = await listOwners({
    q,
    page,
    sort,
    dir,
    from,
    to,
    plan,
  });

  const exportParams = new URLSearchParams({ type: "owners" });
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);
  if (plan === "premium") exportParams.set("subscription", "active");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tutores</h1>
          <p className="text-muted-foreground text-sm">
            Propietarios registrados en la app móvil.
          </p>
        </div>
        {canExport && (
          <ExportMenu
            csvHref={`/reports/export?${exportParams.toString()}&format=csv`}
            xlsxHref={`/reports/export?${exportParams.toString()}&format=xlsx`}
          />
        )}
      </div>

      <TabLinks param="plan" options={PLAN_TABS} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <DataTableSearch placeholder="Buscar por nombre, RUT, correo o teléfono..." />
        <DateRangeFilter />
      </div>

      <DataTable
        columns={getOwnerColumns(canWritePremium)}
        data={rows as OwnerRow[]}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
        emptyMessage="No se encontraron tutores."
      />
    </div>
  );
}
