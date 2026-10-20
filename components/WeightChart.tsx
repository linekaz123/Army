"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatShortDate } from "@/lib/date-utils";
import type { WeightEntry } from "@/lib/types";

export function WeightChart({ entries }: { entries: WeightEntry[] }) {
  const data = [...entries]
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .map((e) => ({ date: e.loggedAt, weight: e.weightKg }));

  if (data.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted">
        Log weight a couple more times to see your trend.
      </div>
    );
  }

  const weights = data.map((d) => d.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const pad = Math.max(0.5, (max - min) * 0.2);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
            minTickGap={32}
          />
          <YAxis
            domain={[min - pad, max + pad]}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v: number) => v.toFixed(0)}
          />
          <Tooltip
            formatter={(value) => [`${value} kg`, "Weight"]}
            labelFormatter={(label) => formatShortDate(label as string)}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--brand)"
            strokeWidth={3}
            dot={{ r: 3, fill: "var(--brand)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
