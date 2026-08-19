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

interface CategoryBarChartProps {
  title: string;
  emptyMessage: string;
  data: { label: string; count: number }[];
  seriesName?: string;
  color?: string;
}

/** Distribution of a total across fixed categories — no time axis. */
export function CategoryBarChart({
  title,
  emptyMessage,
  data,
  seriesName = "Cantidad",
  color = "var(--chart-1)",
}: CategoryBarChartProps) {
  return (
    <Card className="min-w-0 flex-1">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
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
                dataKey="label"
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
