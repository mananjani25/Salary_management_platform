"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type SalaryBarChartPoint = {
  name: string;
  value: number;
};

type SalaryBarChartProps = {
  data: SalaryBarChartPoint[];
  title: string;
  color?: string;
  "data-testid"?: string;
};

export default function SalaryBarChart({ data, title, color = "#6366f1", "data-testid": dataTestId }: SalaryBarChartProps) {
  return (
    <div data-testid={dataTestId} className="chart-card">
      <h2 className="chart-card__title">{title}</h2>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-30}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 11 }}
            />
            <YAxis tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val) => {
                  if (typeof val === "number") {
                    return [`$${val.toLocaleString("en-US")}`, "Avg Salary"];
                  }
                  return ["$0", "Avg Salary"];
                }} />
            <Bar dataKey="value" fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
