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

interface MonthlyBarChartProps {
  title: string;
  emptyMessage: string;
  data: { month: string; count: number }[];
  seriesName?: string;
  color?: string;
}

/** Fixed-width trailing window (e.g. last 6 months) — zero-filled, so a
 * quiet month shows as a real gap instead of disappearing from the axis. */
export function MonthlyBarChart({
  title,
  emptyMessage,
  data,
  seriesName = "Cantidad",
  color = "var(--chart-1)",
}: MonthlyBarChartProps) {
  const hasAnyData = data.some((d) => d.count > 0);

  return (
    <Card className="min-w-0 flex-1">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyData ? (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
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
                dataKey="month"
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
                name={seriesName}
                fill={color}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
