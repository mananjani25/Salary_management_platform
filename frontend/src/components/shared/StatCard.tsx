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
    <div data-testid={dataTestId ?? "stat-card"} className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <p className="stat-card__label">{title}</p>
        {icon && <span style={{ color: 'var(--color-primary)', opacity: 0.7 }}>{icon}</span>}
      </div>
      <p className="stat-card__value">{displayValue}</p>
      {subtitle ? <p data-testid="stat-card-subtitle" className="stat-card__subtitle">{subtitle}</p> : null}
    </div>
  );
}
