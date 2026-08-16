import Link from "next/link";
import { Download } from "lucide-react";
import { listOwnersReport, listPetsReport } from "./actions";
import { listRegions } from "../owners/actions";
import {
  ownersReportColumns,
  type OwnerReportRow,
} from "./owners-report-columns";
import { petsReportColumns, type PetReportRow } from "./pets-report-columns";
import { ReportFilters } from "./report-filters";
import { DataTable } from "@/components/data-table/data-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "owners", label: "Tutores" },
  { value: "pets", label: "Mascotas" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export default async function ReportsPage(props: PageProps<"/reports">) {
  const searchParams = await props.searchParams;
  const tab: Tab = searchParams.tab === "pets" ? "pets" : "owners";
  const page = Number(searchParams.page) || 1;
  const from =
    typeof searchParams.from === "string" ? searchParams.from : undefined;
  const to = typeof searchParams.to === "string" ? searchParams.to : undefined;
  const regionId = searchParams.region
    ? Number(searchParams.region)
    : undefined;
  const species =
    typeof searchParams.species === "string" ? searchParams.species : undefined;
  const subscriptionStatus =
    typeof searchParams.subscription === "string"
      ? searchParams.subscription
      : undefined;

  const regions = await listRegions();

  const exportParams = new URLSearchParams();
  exportParams.set("type", tab);
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);
  if (regionId) exportParams.set("region", String(regionId));
  if (tab === "pets" && species) exportParams.set("species", species);
  if (tab === "owners" && subscriptionStatus)
    exportParams.set("subscription", subscriptionStatus);

  const csvHref = `/reports/export?${exportParams.toString()}&format=csv`;
  const xlsxHref = `/reports/export?${exportParams.toString()}&format=xlsx`;

  const report =
    tab === "owners"
      ? await listOwnersReport({ page, from, to, regionId, subscriptionStatus })
      : await listPetsReport({ page, from, to, regionId, species });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reportes</h1>
          <p className="text-muted-foreground text-sm">
            Reportes detallados de tutores y mascotas registrados en la app, con
            exportación a CSV/XLSX.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={csvHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-full",
            )}
          >
            <Download className="size-4" />
            Exportar CSV
          </a>
          <a href={xlsxHref} className={cn(buttonVariants(), "rounded-full")}>
            <Download className="size-4" />
            Exportar XLSX
          </a>
        </div>
      </div>

      <div className="border-border flex gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/reports?tab=${t.value}`}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              tab === t.value
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <ReportFilters tab={tab} regions={regions} />

      {tab === "owners" ? (
        <DataTable
          columns={ownersReportColumns}
          data={report.rows as OwnerReportRow[]}
          page={report.page}
          pageCount={report.pageCount}
          rowCount={report.rowCount}
          emptyMessage="No hay tutores que coincidan con los filtros."
        />
      ) : (
        <DataTable
          columns={petsReportColumns}
          data={report.rows as PetReportRow[]}
          page={report.page}
          pageCount={report.pageCount}
          rowCount={report.rowCount}
          emptyMessage="No hay mascotas que coincidan con los filtros."
        />
      )}
    </div>
  );
}
