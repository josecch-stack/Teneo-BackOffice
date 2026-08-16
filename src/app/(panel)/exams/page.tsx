import Link from "next/link";
import { listLabExams, listImagingExams } from "./actions";
import { labExamColumns, type LabExamRow } from "./lab-columns";
import { imagingExamColumns, type ImagingExamRow } from "./imaging-columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/lib/utils";

export default async function ExamsPage(props: PageProps<"/exams">) {
  const searchParams = await props.searchParams;
  const type = searchParams.type === "imaging" ? "imaging" : "lab";
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Number(searchParams.page) || 1;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  const { rows, rowCount, pageCount } =
    type === "lab"
      ? await listLabExams({ q, page, sort, dir })
      : await listImagingExams({ q, page, sort, dir });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Exámenes</h1>
          <p className="text-muted-foreground text-sm">
            Resultados de laboratorio e imagenología.
          </p>
        </div>
        <LinkButton href={`/exams/new?type=${type}`} className="rounded-full">
          Nuevo examen
        </LinkButton>
      </div>

      <div className="border-border flex gap-1 border-b">
        {(
          [
            { value: "lab", label: "Laboratorio" },
            { value: "imaging", label: "Imagenología" },
          ] as const
        ).map((tab) => (
          <Link
            key={tab.value}
            href={`/exams?type=${tab.value}`}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              type === tab.value
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <DataTableSearch
        placeholder={
          type === "lab"
            ? "Buscar por nombre de examen..."
            : "Buscar por zona del cuerpo..."
        }
      />

      {type === "lab" ? (
        <DataTable
          columns={labExamColumns}
          data={rows as LabExamRow[]}
          page={page}
          pageCount={pageCount}
          rowCount={rowCount}
          emptyMessage="No se encontraron exámenes de laboratorio."
        />
      ) : (
        <DataTable
          columns={imagingExamColumns}
          data={rows as ImagingExamRow[]}
          page={page}
          pageCount={pageCount}
          rowCount={rowCount}
          emptyMessage="No se encontraron exámenes de imagenología."
        />
      )}
    </div>
  );
}
