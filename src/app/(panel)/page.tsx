import { verifySession } from "@/lib/auth/dal";
import { getDashboardStats } from "./dashboard-actions";
import { StatTile } from "./stat-tile";
import { SpeciesChart } from "./species-chart";

export default async function DashboardPage() {
  const session = await verifySession();
  const stats = await getDashboardStats();

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

      <SpeciesChart
        data={stats.speciesDistribution.map((s) => ({
          species: s.species,
          count: s.count,
        }))}
      />
    </div>
  );
}
