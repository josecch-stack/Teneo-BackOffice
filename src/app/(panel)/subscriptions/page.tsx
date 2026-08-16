import { listSubscriptions } from "./actions";
import { subscriptionColumns, type SubscriptionRow } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";

export default async function SubscriptionsPage(
  props: PageProps<"/subscriptions">,
) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Number(searchParams.page) || 1;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  const { rows, rowCount, pageCount } = await listSubscriptions({
    q,
    page,
    sort,
    dir,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Suscripciones</h1>
        <p className="text-muted-foreground text-sm">
          Planes y estado de suscripción de los tutores. Solo lectura — la
          gestión de pagos vive en el proveedor.
        </p>
      </div>

      <DataTableSearch placeholder="Buscar por nombre del tutor..." />

      <DataTable
        columns={subscriptionColumns}
        data={rows as SubscriptionRow[]}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
        emptyMessage="No hay suscripciones registradas."
      />
    </div>
  );
}
