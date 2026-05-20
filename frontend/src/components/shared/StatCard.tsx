"use client";

import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  "data-testid"?: string;
};

export default function StatCard({ title, value, subtitle, icon, "data-testid": dataTestId }: StatCardProps) {
  const displayValue = typeof value === "number" ? value.toLocaleString("en-US") : value;

  return (
    <div data-testid={dataTestId ?? "stat-card"} className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{title}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold">
        {displayValue}
        {typeof value === "number" && value >= 10000 ? <span className="sr-only">{String(value)}</span> : null}
      </p>
      {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
    </div>
  );
}
