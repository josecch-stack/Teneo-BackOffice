import Link from "next/link";
import { getExpiringVaccines, getExpiringDewormings } from "./actions";
import { listRegions } from "../owners/actions";
import { RegionFilter } from "./region-filter";
import { NextDoseBadge } from "@/components/next-dose-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function VencimientosPage(
  props: PageProps<"/vencimientos">,
) {
  const searchParams = await props.searchParams;
  const regionId = searchParams.region
    ? Number(searchParams.region)
    : undefined;

  const [vaccines, dewormings, regions] = await Promise.all([
    getExpiringVaccines({ regionId }),
    getExpiringDewormings({ regionId }),
    listRegions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Vencimientos</h1>
          <p className="text-muted-foreground text-sm">
            Vacunas y desparasitaciones vencidas o por vencer en los próximos 30
            días.
          </p>
        </div>
        <RegionFilter regions={regions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Vacunas ({vaccines.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vaccines.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Sin vacunas vencidas o por vencer.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {vaccines.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div>
                    <Link
                      href={`/vaccines/${v.id}`}
                      className="font-medium hover:underline"
                    >
                      {v.vaccine_name}
                    </Link>
                    <span className="text-muted-foreground">
                      {" "}
                      · {v.pets?.name} · {v.pets?.owners?.first_name}{" "}
                      {v.pets?.owners?.last_name ?? ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <NextDoseBadge
                      status="pending"
                      applicationDate={v.application_date}
                      nextDoseDate={null}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      title="Motor de notificaciones — Fase 6"
                    >
                      Enviar recordatorio
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Desparasitación ({dewormings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dewormings.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Sin desparasitaciones vencidas o por vencer.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {dewormings.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div>
                    <Link
                      href={`/dewormings/${d.id}`}
                      className="font-medium hover:underline"
                    >
                      {d.product}
                    </Link>
                    <span className="text-muted-foreground">
                      {" "}
                      · {d.pets?.name} · {d.pets?.owners?.first_name}{" "}
                      {d.pets?.owners?.last_name ?? ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <NextDoseBadge
                      status="pending"
                      applicationDate={d.application_date}
                      nextDoseDate={null}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      title="Motor de notificaciones — Fase 6"
                    >
                      Enviar recordatorio
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
