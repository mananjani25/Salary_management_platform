"use client";

import { useQuery } from "@tanstack/react-query";

import { getByCountry, getSalaryDistribution, getSummary } from "../api/insights";
import SalaryBarChart from "../components/shared/SalaryBarChart";
import SalaryDistributionChart from "../components/shared/SalaryDistributionChart";
import StatCard from "../components/shared/StatCard";

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["insights", "summary"],
    queryFn: getSummary,
  });

  const { data: countryData, isLoading: countryLoading } = useQuery({
    queryKey: ["insights", "by-country"],
    queryFn: () => getByCountry(),
  });

  const { data: distributionData, isLoading: distributionLoading } = useQuery({
    queryKey: ["insights", "salary-distribution"],
    queryFn: () => getSalaryDistribution(),
  });

  const isLoading = summaryLoading || countryLoading || distributionLoading;

  if (isLoading) {
    return (
      <div data-testid="dashboard-skeleton" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} data-testid="dashboard-stat-skeleton" className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-80 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Employees" value={`${summary?.total_employees ?? 0} employees`} />
        <StatCard title="Active Employees" value={summary?.active_employees ?? 0} />
        <StatCard title="Average Salary" value={`$${(summary?.global_avg_salary ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard title="Total Salary Spend" value={`$${Math.round(summary?.total_salary_spend ?? 0).toLocaleString("en-US")}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SalaryBarChart
          data-testid="salary-by-country-chart"
          title="Salary by Country"
          data={(countryData?.data ?? []).map((row) => ({
            name: row.country,
            value: row.avg_salary,
          }))}
        />
        <SalaryDistributionChart
          data-testid="salary-distribution-chart"
          title="Salary Distribution (All Employees)"
          buckets={distributionData?.buckets ?? []}
        />
      </div>
    </div>
  );
}
