"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SalaryBarChartPoint = {
  name: string;
  value: number;
};

type SalaryBarChartProps = {
  data: SalaryBarChartPoint[];
  title: string;
  defaultType?: "bar" | "area" | "donut" | "radar";
  color?: string;
  "data-testid"?: string;
};

const PIE_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
];

export default function SalaryBarChart({
  data,
  title,
  defaultType = "bar",
  color = "#6366f1",
  "data-testid": dataTestId,
}: SalaryBarChartProps) {
  const [chartType, setChartType] = useState<"bar" | "area" | "donut" | "radar">(defaultType);

  // Fallback for empty data
  if (!data || data.length === 0) {
    return (
      <div data-testid={dataTestId} className="chart-card flex h-80 flex-col items-center justify-center">
        <h2 className="chart-card__title">{title}</h2>
        <p className="text-sm text-slate-400">No chart data available</p>
      </div>
    );
  }

  // Visual/Mathematical constraints based on data size:
  // - Area Chart needs at least 2 points to draw an area under a line.
  // - Radar Chart needs at least 3 points to form a closed polygon.
  const isAreaDisabled = data.length < 2;
  const isRadarDisabled = data.length < 3;

  // Fallback to "bar" if current type is unsupported by the current dataset size
  let activeChartType = chartType;
  if (activeChartType === "area" && isAreaDisabled) {
    activeChartType = "bar";
  } else if (activeChartType === "radar" && isRadarDisabled) {
    activeChartType = "bar";
  }

  const gradientId = `colorGrad-${title.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div data-testid={dataTestId} className="chart-card">
      {/* Interactive Chart Header with custom-styled toggle tabs */}
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
          {(["bar", "area", "donut", "radar"] as const).map((type) => {
            const isDisabled = (type === "area" && isAreaDisabled) || (type === "radar" && isRadarDisabled);
            const isActive = activeChartType === type;

            return (
              <button
                key={type}
                type="button"
                disabled={isDisabled}
                className="px-2.5 py-1 text-xs font-semibold capitalize transition-all"
                style={{
                  background: isActive ? "var(--color-surface)" : "transparent",
                  color: isDisabled
                    ? "var(--color-text-3)"
                    : isActive
                    ? "var(--color-text-1)"
                    : "var(--color-text-3)",
                  border: "none",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                  opacity: isDisabled ? 0.45 : 1,
                }}
                title={
                  isDisabled
                    ? type === "area"
                      ? "Area chart requires at least 2 data points"
                      : "Radar chart requires at least 3 data points"
                    : ""
                }
                onClick={() => setChartType(type)}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {(() => {
            switch (activeChartType) {
              case "area":
                return (
                  <AreaChart data={data} margin={{ bottom: 10, right: 10 }}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 10, fill: "var(--color-text-2)" }}
                    />
                    <YAxis
                      tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 10, fill: "var(--color-text-2)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val) => {
                        if (typeof val === "number") {
                          return [`$${Math.round(val).toLocaleString("en-US")}`, "Avg Salary"];
                        }
                        return ["$0", "Avg Salary"];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#${gradientId})`}
                    />
                  </AreaChart>
                );

              case "donut":
                return (
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="48%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          style={{ outline: "none" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val) => {
                        if (typeof val === "number") {
                          return [`$${Math.round(val).toLocaleString("en-US")}`, "Avg Salary"];
                        }
                        return ["$0", "Avg Salary"];
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconSize={8}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 10, fill: "var(--color-text-2)" }}
                    />
                  </PieChart>
                );

              case "radar":
                return (
                  <RadarChart cx="50%" cy="46%" outerRadius="72%" data={data}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "var(--color-text-2)" }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, "auto"]}
                      tick={{ fontSize: 8, fill: "var(--color-text-3)" }}
                      tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Radar
                      name="Avg Salary"
                      dataKey="value"
                      stroke={color}
                      fill={color}
                      fillOpacity={0.25}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val) => {
                        if (typeof val === "number") {
                          return [`$${Math.round(val).toLocaleString("en-US")}`, "Avg Salary"];
                        }
                        return ["$0", "Avg Salary"];
                      }}
                    />
                  </RadarChart>
                );

              case "bar":
              default:
                return (
                  <BarChart data={data} margin={{ bottom: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 10, fill: "var(--color-text-2)" }}
                    />
                    <YAxis
                      tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 10, fill: "var(--color-text-2)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val) => {
                        if (typeof val === "number") {
                          return [`$${Math.round(val).toLocaleString("en-US")}`, "Avg Salary"];
                        }
                        return ["$0", "Avg Salary"];
                      }}
                    />
                    <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                );
            }
          })()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
