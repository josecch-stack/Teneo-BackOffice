import { format } from "date-fns";
import { listOwnersReportAll, listPetsReportAll } from "../actions";
import type { OwnerReportRow } from "../owners-report-columns";
import type { PetReportRow } from "../pets-report-columns";
import { toCSV, toXLSX, type ExportColumn } from "@/lib/utils/export";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/utils/subscription";
import { SPECIES_OPTIONS } from "@/lib/validations/pet";
import { writeAuditLog } from "@/lib/audit/log";

const speciesLabel = (value: string) =>
  SPECIES_OPTIONS.find((s) => s.value === value)?.label ?? value;

const ownersExportColumns: ExportColumn<OwnerReportRow>[] = [
  {
    header: "Nombre",
    value: (r) => `${r.first_name} ${r.last_name ?? ""}`.trim(),
  },
  { header: "RUT", value: (r) => r.rut ?? "" },
  { header: "Teléfono", value: (r) => r.phone ?? "" },
  { header: "Correo", value: (r) => r.email ?? "" },
  { header: "Dirección", value: (r) => r.address ?? "" },
  { header: "Región", value: (r) => r.regions?.name ?? "" },
  { header: "Comuna", value: (r) => r.communes?.name ?? "" },
  { header: "N° de mascotas", value: (r) => r.pets?.[0]?.count ?? 0 },
  {
    header: "Estado de suscripción",
    value: (r) => {
      const status = r.subscriptions?.[0]?.status;
      return status
        ? (SUBSCRIPTION_STATUS_LABELS[status] ?? status)
        : "Sin suscripción";
    },
  },
  {
    header: "Fecha de registro",
    value: (r) => format(new Date(r.created_at), "dd/MM/yyyy"),
  },
];

const petsExportColumns: ExportColumn<PetReportRow>[] = [
  { header: "Nombre", value: (r) => r.name },
  { header: "Especie", value: (r) => speciesLabel(r.species) },
  { header: "Raza", value: (r) => r.breed ?? "" },
  {
    header: "Sexo",
    value: (r) =>
      r.sex === "macho" ? "Macho" : r.sex === "hembra" ? "Hembra" : "",
  },
  {
    header: "Fecha de nacimiento",
    value: (r) => format(new Date(r.birth_date), "dd/MM/yyyy"),
  },
  { header: "Esterilizado", value: (r) => (r.is_sterilized ? "Sí" : "No") },
  { header: "N° de chip", value: (r) => r.chip_number ?? "" },
  {
    header: "Tutor",
    value: (r) =>
      r.owners
        ? `${r.owners.first_name} ${r.owners.last_name ?? ""}`.trim()
        : "",
  },
  { header: "Región", value: (r) => r.owners?.regions?.name ?? "" },
  {
    header: "Fecha de registro",
    value: (r) => format(new Date(r.created_at), "dd/MM/yyyy"),
  },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") === "pets" ? "pets" : "owners";
  const exportFormat =
    url.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const region = url.searchParams.get("region");
  const regionId = region ? Number(region) : undefined;
  const species = url.searchParams.get("species") ?? undefined;
  const subscriptionStatus = url.searchParams.get("subscription") ?? undefined;
  const plan = url.searchParams.get("plan") ?? undefined;

  let buffer: string | Buffer;
  let filename: string;
  let rowCount: number;
  const filters = { from, to, regionId, species, subscriptionStatus, plan };

  if (type === "owners") {
    const rows = (await listOwnersReportAll({
      from,
      to,
      regionId,
      subscriptionStatus,
      plan,
    })) as OwnerReportRow[];
    rowCount = rows.length;
    buffer =
      exportFormat === "csv"
        ? toCSV(rows, ownersExportColumns)
        : await toXLSX(rows, ownersExportColumns, "Tutores");
    filename = `tutores-${format(new Date(), "yyyy-MM-dd")}.${exportFormat}`;
  } else {
    const rows = (await listPetsReportAll({
      from,
      to,
      regionId,
      species,
    })) as PetReportRow[];
    rowCount = rows.length;
    buffer =
      exportFormat === "csv"
        ? toCSV(rows, petsExportColumns)
        : await toXLSX(rows, petsExportColumns, "Mascotas");
    filename = `mascotas-${format(new Date(), "yyyy-MM-dd")}.${exportFormat}`;
  }

  const contentType =
    exportFormat === "csv"
      ? "text/csv; charset=utf-8"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  await writeAuditLog({
    action: "export",
    resource: type === "owners" ? "owners_report" : "pets_report",
    newValues: { filters, format: exportFormat, rowCount },
  });

  return new Response(
    typeof buffer === "string" ? buffer : new Uint8Array(buffer),
    {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    },
  );
}
