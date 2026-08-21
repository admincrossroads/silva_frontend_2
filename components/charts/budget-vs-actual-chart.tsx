"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BvAData {
  discipline: string;
  budget: number;
  actual: number;
}

export function BudgetVsActualChart({ data }: { data: BvAData[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={2} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="discipline"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
          labelStyle={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}
          itemStyle={{ fontSize: 12 }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
        />
        <Bar dataKey="budget" fill="#94a3b8" radius={[3, 3, 0, 0]} name="Budget" />
        <Bar dataKey="actual" fill="#10b981" radius={[3, 3, 0, 0]} name="Actual" />
      </BarChart>
    </ResponsiveContainer>
  );
}
