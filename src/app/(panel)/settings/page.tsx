import Link from "next/link";
import { requirePermission } from "@/lib/auth/dal";
import {
  listVaccineCatalogFull,
  listLabCatalogFull,
  listRegionsFull,
  listCommunesFull,
} from "./actions";
import { VaccineCatalogTable } from "./vaccine-catalog-table";
import { LabCatalogTable } from "./lab-catalog-table";
import { RegionsTable } from "./regions-table";
import { CommunesTable } from "./communes-table";
import { FixedValuesCatalog } from "./fixed-values";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "vaccines", label: "Catálogo de vacunas" },
  { value: "labs", label: "Catálogo de laboratorio" },
  { value: "regions", label: "Regiones" },
  { value: "communes", label: "Comunas" },
  { value: "fixed", label: "Valores fijos" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export default async function SettingsPage(props: PageProps<"/settings">) {
  // Every tab reads panel-only reference data — gate once here so the
  // "Valores fijos" tab (no DB call at all) is covered too.
  await requirePermission("catalog:manage");

  const searchParams = await props.searchParams;
  const tab: Tab = TABS.some((t) => t.value === searchParams.tab)
    ? (searchParams.tab as Tab)
    : "vaccines";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-muted-foreground text-sm">
          Catálogos maestros — de solo lectura, no se editan desde el panel.
        </p>
      </div>

      <div className="border-border flex flex-wrap gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/settings?tab=${t.value}`}
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

      {tab === "vaccines" && (
        <VaccineCatalogTable rows={await listVaccineCatalogFull()} />
      )}
      {tab === "labs" && <LabCatalogTable rows={await listLabCatalogFull()} />}
      {tab === "regions" && <RegionsTable rows={await listRegionsFull()} />}
      {tab === "communes" && <CommunesTable rows={await listCommunesFull()} />}
      {tab === "fixed" && <FixedValuesCatalog />}
    </div>
  );
}
