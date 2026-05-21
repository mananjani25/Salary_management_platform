"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { DistributionBucket } from "../../types/insights";

type SalaryDistributionChartProps = {
  buckets: DistributionBucket[];
  title?: string;
  "data-testid"?: string;
};

export default function SalaryDistributionChart({ buckets, title = "Salary Distribution", "data-testid": dataTestId }: SalaryDistributionChartProps) {
  return (
    <div data-testid={dataTestId} className="rounded-lg border p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip formatter={(val) => {
              if (typeof val === "number") {
                return [val, "Employees"];
              }
              return [0, "Employees"];
            }} />
            <Bar dataKey="count" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
