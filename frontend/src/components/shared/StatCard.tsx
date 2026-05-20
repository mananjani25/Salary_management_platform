"use client";

import type { ReactNode } from "react";

import { Card } from "../ui/card";

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
    <Card data-testid={dataTestId ?? "stat-card"} className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-gray-600">{title}</h3>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold">{displayValue}</p>
      {subtitle ? (
        <p data-testid="stat-card-subtitle" className="mt-1 text-xs text-gray-500">
          {subtitle}
        </p>
      ) : null}
    </Card>
  );
}
