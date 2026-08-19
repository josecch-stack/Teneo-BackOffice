import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InitialsAvatar } from "@/components/initials-avatar";
import { Badge } from "@/components/ui/badge";
import {
  formatCLP,
  SUBSCRIPTION_BILLING_CYCLE_LABELS,
} from "@/lib/utils/subscription";
import type { RecentOwnerRow } from "./dashboard-actions";

export function RecentOwnersCard({ rows }: { rows: RecentOwnerRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Nuevos usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Sin tutores registrados todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-muted-foreground border-border border-b text-left text-xs">
                  <th className="pb-2 font-medium">Usuario</th>
                  <th className="pb-2 font-medium">Mascotas</th>
                  <th className="pb-2 font-medium">Suscripción</th>
                  <th className="pb-2 font-medium">Ingreso</th>
                  <th className="pb-2 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.user_id}
                    className="border-border/60 border-b last:border-0"
                  >
                    <td className="py-3">
                      <Link
                        href={`/owners/${row.user_id}`}
                        className="flex items-center gap-3"
                      >
                        <InitialsAvatar name={row.name} className="size-9" />
                        <span className="flex flex-col">
                          <span className="text-foreground font-medium">
                            {row.name}
                          </span>
                          {row.email && (
                            <span className="text-muted-foreground text-xs">
                              {row.email}
                            </span>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3">{row.petCount}</td>
                    <td className="py-3">
                      {row.planName ? (
                        <Badge className="bg-amber-500/10 text-amber-600">
                          {row.planName}
                          {row.billingCycle
                            ? ` ${SUBSCRIPTION_BILLING_CYCLE_LABELS[row.billingCycle] ?? row.billingCycle}`
                            : ""}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Free</span>
                      )}
                    </td>
                    <td className="py-3 tabular-nums">
                      {formatCLP(row.price ?? 0)}
                    </td>
                    <td className="text-muted-foreground py-3">
                      {format(new Date(row.created_at), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
