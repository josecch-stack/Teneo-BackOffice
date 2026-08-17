import { format } from "date-fns";
import { es } from "date-fns/locale";
import { verifySession } from "@/lib/auth/dal";
import { listPanelUsers } from "./actions";
import { CreatePanelUserDialog } from "./create-panel-user-dialog";
import { PanelUserRoleSelect } from "./panel-user-role-select";
import { PanelUserActiveToggle } from "./panel-user-active-toggle";
import { InitialsAvatar } from "@/components/initials-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PanelUsersPage() {
  const session = await verifySession();
  const rows = await listPanelUsers();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios del panel</h1>
          <p className="text-muted-foreground text-sm">
            Cuentas de staff con acceso al backoffice — distinto de los tutores
            de la app móvil.
          </p>
        </div>
        <CreatePanelUserDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => {
                const isSelf = row.user_id === session.userId;
                return (
                  <TableRow key={row.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={row.full_name} />
                        <span className="flex flex-col">
                          <span className="text-foreground font-bold">
                            {row.full_name}
                            {isSelf && (
                              <span className="text-muted-foreground ml-1 text-xs">
                                (tú)
                              </span>
                            )}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {row.email}
                          </span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PanelUserRoleSelect
                        userId={row.user_id}
                        role={row.role}
                        disabled={isSelf}
                      />
                    </TableCell>
                    <TableCell>
                      <PanelUserActiveToggle
                        userId={row.user_id}
                        active={row.active}
                        disabled={isSelf}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(row.created_at), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground h-24 text-center"
                >
                  No hay usuarios de panel registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
