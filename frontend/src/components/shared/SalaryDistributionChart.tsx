"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DistributionBucket } from "../../types/insights";

type SalaryDistributionChartProps = {
  buckets: DistributionBucket[];
  title?: string;
  defaultType?: "area" | "bar" | "line";
  "data-testid"?: string;
};

export default function SalaryDistributionChart({
  buckets,
  title = "Salary Distribution",
  defaultType = "area",
  "data-testid": dataTestId,
}: SalaryDistributionChartProps) {
  const [chartType, setChartType] = useState<"area" | "bar" | "line">(defaultType);

  if (!buckets || buckets.length === 0) {
    return (
      <div data-testid={dataTestId} className="chart-card flex h-80 flex-col items-center justify-center">
        <h2 className="chart-card__title">{title}</h2>
        <p className="text-sm text-slate-400">No distribution data available</p>
      </div>
    );
  }

  const gradientId = `colorGrad-distribution`;

  return (
    <div data-testid={dataTestId} className="chart-card">
      {/* Interactive header with toggle controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="chart-card__title" style={{ margin: 0 }}>{title}</h2>
        <div
          className="flex rounded-lg p-0.5"
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            alignSelf: "flex-start",
          }}
        >
          {(["area", "bar", "line"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className="px-2.5 py-1 text-xs font-semibold capitalize transition-all"
              style={{
                background: chartType === type ? "var(--color-surface)" : "transparent",
                color: chartType === type ? "var(--color-text-1)" : "var(--color-text-3)",
                border: "none",
                cursor: "pointer",
                borderRadius: "6px",
                padding: "4px 10px",
                boxShadow: chartType === type ? "var(--shadow-sm)" : "none",
              }}
              onClick={() => setChartType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {(() => {
            switch (chartType) {
              case "bar":
                return (
                  <BarChart data={buckets} margin={{ bottom: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--color-text-2)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-text-2)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val) => {
                        if (typeof val === "number") {
                          return [val, "Employees"];
                        }
                        return [0, "Employees"];
                      }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                );

              case "line":
                return (
                  <LineChart data={buckets} margin={{ bottom: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--color-text-2)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-text-2)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val) => {
                        if (typeof val === "number") {
                          return [val, "Employees"];
                        }
                        return [0, "Employees"];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: "var(--color-surface)" }}
                    />
                  </LineChart>
                );

              case "area":
              default:
                return (
                  <AreaChart data={buckets} margin={{ bottom: 10, right: 10 }}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--color-text-2)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-text-2)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val) => {
                        if (typeof val === "number") {
                          return [val, "Employees"];
                        }
                        return [0, "Employees"];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#${gradientId})`}
                    />
                  </AreaChart>
                );
            }
          })()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
