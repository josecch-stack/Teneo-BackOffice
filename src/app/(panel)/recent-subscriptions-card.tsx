import { DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_BILLING_CYCLE_LABELS } from "@/lib/utils/subscription";
import type { RecentSubscriptionRow } from "./dashboard-actions";

export function RecentSubscriptionsCard({
  rows,
}: {
  rows: RecentSubscriptionRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Nuevas suscripciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Sin suscripciones registradas todavía.
          </p>
        ) : (
          <ul className="flex flex-col">
            {rows.map((row) => (
              <li
                key={row.id}
                className="border-border/60 flex items-center justify-between gap-3 border-b py-3 text-sm last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
                    <DollarSign className="size-4" />
                  </span>
                  <span className="text-foreground">
                    {row.ownerName} — {row.planName}
                    {row.billingCycle
                      ? ` ${SUBSCRIPTION_BILLING_CYCLE_LABELS[row.billingCycle] ?? row.billingCycle}`
                      : ""}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {format(new Date(row.created_at), "dd/MM/yyyy, h:mm a", {
                    locale: es,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
