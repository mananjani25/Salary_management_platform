"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getByCountry, getByDepartment, getByJobTitle, getMetaFilters } from "../../api/insights";
import SalaryBarChart from "../../components/shared/SalaryBarChart";
import StatCard from "../../components/shared/StatCard";

type TabKey = "country" | "job-title" | "department";

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("country");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedJobTitleCountry, setSelectedJobTitleCountry] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("");

  const { data: metaFilters } = useQuery({
    queryKey: ["meta-filters"],
    queryFn: getMetaFilters,
  });

  const { data: countryInsights, isLoading: countryLoading } = useQuery({
    queryKey: ["insights", "country", selectedCountry],
    queryFn: () => getByCountry(selectedCountry),
  });

  const { data: jobTitleInsights } = useQuery({
    queryKey: ["insights", "job-title", selectedJobTitleCountry, selectedJobTitle],
    queryFn: () => getByJobTitle(selectedJobTitleCountry, selectedJobTitle),
  });

  const { data: departmentInsights } = useQuery({
    queryKey: ["insights", "department"],
    queryFn: getByDepartment,
  });

  const countryStats = useMemo(() => {
    const rows = countryInsights?.data ?? [];
    if (rows.length === 0) return null;
    const target = selectedCountry ? rows[0] : rows[0];
    return {
      min: target.min_salary,
      max: target.max_salary,
      avg: target.avg_salary,
    };
  }, [countryInsights, selectedCountry]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Insights</h1>

      <div role="tablist" aria-label="Insights tabs" className="flex gap-2">
        <button role="tab" aria-selected={activeTab === "country"} onClick={() => setActiveTab("country")}>
          Country Analysis
        </button>
        <button role="tab" aria-selected={activeTab === "job-title"} onClick={() => setActiveTab("job-title")}>
          Job Title Analysis
        </button>
        <button role="tab" aria-selected={activeTab === "department"} onClick={() => setActiveTab("department")}>
          Department Analysis
        </button>
      </div>

      {activeTab === "country" && (
        <section>
          <label htmlFor="country-filter">Country</label>
          <select
            id="country-filter"
            aria-label="Country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {(metaFilters?.countries ?? []).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard title="Min Salary" value={`$${Math.round(countryStats?.min ?? 0).toLocaleString("en-US")}`} />
            <StatCard title="Max Salary" value={`$${Math.round(countryStats?.max ?? 0).toLocaleString("en-US")}`} />
            <StatCard title="Avg Salary" value={`$${Math.round(countryStats?.avg ?? 0).toLocaleString("en-US")}`} />
          </div>
          {countryLoading ? <div className="mt-4 h-24 animate-pulse rounded bg-gray-200" /> : null}
          <div className="mt-4">
            <SalaryBarChart
              title="Average Salary by Country"
              data={(countryInsights?.data ?? []).map((x) => ({ name: x.country, value: x.avg_salary }))}
            />
          </div>
        </section>
      )}

      {activeTab === "job-title" && (
        <section>
          <label htmlFor="job-country-filter">Country</label>
          <select
            id="job-country-filter"
            aria-label="Country"
            value={selectedJobTitleCountry}
            onChange={(e) => setSelectedJobTitleCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {(metaFilters?.countries ?? []).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>

          <label htmlFor="job-title-filter">Job Title</label>
          <select
            id="job-title-filter"
            aria-label="Job Title"
            value={selectedJobTitle}
            onChange={(e) => setSelectedJobTitle(e.target.value)}
          >
            <option value="">All Job Titles</option>
            {(metaFilters?.job_titles ?? []).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>

          <div className="mt-4">
            {(jobTitleInsights?.data ?? []).length > 0 ? <p>Job title data loaded</p> : <p>No data</p>}
          </div>
        </section>
      )}

      {activeTab === "department" && (
        <section>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {(departmentInsights?.data ?? []).map((x) => (
              <div key={x.department} className="rounded border p-3">
                <p>{x.department}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
