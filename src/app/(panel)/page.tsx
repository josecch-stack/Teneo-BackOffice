import { verifySession } from "@/lib/auth/dal";
import {
  getDashboardStats,
  getRecentOwners,
  getRecentSubscriptions,
} from "./dashboard-actions";
import { StatTile } from "./stat-tile";
import { CategoryBarChart } from "./category-bar-chart";
import { MonthlyBarChart } from "./monthly-bar-chart";
import { RecentOwnersCard } from "./recent-owners-card";
import { RecentSubscriptionsCard } from "./recent-subscriptions-card";

export default async function DashboardPage() {
  const session = await verifySession();
  const [stats, recentOwners, recentSubscriptions] = await Promise.all([
    getDashboardStats(),
    getRecentOwners(),
    getRecentSubscriptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-foreground text-3xl font-bold">
        Hola, {session.email.split("@")[0]}
      </h1>

      <div className="flex flex-wrap gap-4">
        <StatTile label="Tutores activos" value={stats.ownersTotal} />
        <StatTile label="Mascotas activas" value={stats.petsTotal} />
        <StatTile
          label="Tutores nuevos este mes"
          value={stats.ownersNewThisMonth}
        />
        <StatTile
          label="Mascotas nuevas este mes"
          value={stats.petsNewThisMonth}
        />
        <StatTile label="Mascotas compartidas" value={stats.petSharesTotal} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MonthlyBarChart
          title="Usuarios registrados por mes"
          emptyMessage="Sin registros en los últimos 6 meses."
          data={stats.ownersByMonth}
          seriesName="Tutores"
        />
        <CategoryBarChart
          title="Mascotas por especie"
          emptyMessage="Sin mascotas registradas todavía."
          data={stats.speciesDistribution.map((s) => ({
            label: s.species,
            count: s.count,
          }))}
          seriesName="Mascotas"
          color="var(--chart-2)"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MonthlyBarChart
          title="Suscripciones por mes"
          emptyMessage="Sin suscripciones en los últimos 6 meses."
          data={stats.subscriptionsByMonth}
          seriesName="Suscripciones"
        />
        <CategoryBarChart
          title="Notificaciones por tipo"
          emptyMessage="Sin notificaciones registradas todavía."
          data={stats.notificationsByType}
          seriesName="Notificaciones"
          color="var(--chart-2)"
        />
      </div>

      <RecentOwnersCard rows={recentOwners} />
      <RecentSubscriptionsCard rows={recentSubscriptions} />
    </div>
  );
}
