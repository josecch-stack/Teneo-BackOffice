import { listNotifications } from "./actions";
import { notificationColumns, type NotificationRow } from "./columns";
import { StatusFilter } from "./status-filter";
import { ComposeNotificationDialog } from "./compose-notification-dialog";
import { verifySession, hasPermission } from "@/lib/auth/dal";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";

export default async function NotificationsPage(
  props: PageProps<"/notifications">,
) {
  const session = await verifySession();
  const canSend = hasPermission(session, "notification:send");

  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const status =
    searchParams.status === "sent" || searchParams.status === "pending"
      ? searchParams.status
      : undefined;
  const page = Number(searchParams.page) || 1;

  const { rows, rowCount, pageCount } = await listNotifications({
    q,
    status,
    page,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notificaciones</h1>
          <p className="text-muted-foreground text-sm">
            Recordatorios automáticos y notificaciones manuales enviadas a los
            tutores.
          </p>
        </div>
        {canSend && <ComposeNotificationDialog />}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch placeholder="Buscar por título o mensaje..." />
        <StatusFilter />
      </div>

      <DataTable
        columns={notificationColumns}
        data={rows as NotificationRow[]}
        page={page}
        pageCount={pageCount}
        rowCount={rowCount}
        emptyMessage="No se encontraron notificaciones."
      />
    </div>
  );
}
