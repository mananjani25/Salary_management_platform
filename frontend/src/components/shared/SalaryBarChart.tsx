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

export default function SalaryBarChart({ data, title, color = "#2563eb", "data-testid": dataTestId }: SalaryBarChartProps) {
  return (
    <div data-testid={dataTestId} className="rounded-lg border p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
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
