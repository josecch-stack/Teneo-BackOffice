"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpeciesChartProps {
  data: { species: string; count: number }[];
}

export function SpeciesChart({ data }: SpeciesChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Mascotas por especie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Sin mascotas registradas todavía.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Mascotas por especie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-border"
            />
            <XAxis
              dataKey="species"
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              className="fill-muted-foreground text-xs"
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--popover-foreground)",
                fontSize: "0.8rem",
              }}
            />
            <Bar
              dataKey="count"
              name="Mascotas"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
