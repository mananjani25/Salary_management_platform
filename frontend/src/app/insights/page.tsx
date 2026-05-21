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
    if (selectedCountry) {
      // specific country → single row
      return { min: rows[0].min_salary, max: rows[0].max_salary, avg: rows[0].avg_salary };
    }
    // All countries → aggregate
    const min = Math.min(...rows.map((r) => r.min_salary));
    const max = Math.max(...rows.map((r) => r.max_salary));
    const totalSpend = rows.reduce((s, r) => s + r.avg_salary * r.employee_count, 0);
    const totalCount = rows.reduce((s, r) => s + r.employee_count, 0);
    const avg = totalCount > 0 ? totalSpend / totalCount : 0;
    return { min, max, avg };
  }, [countryInsights, selectedCountry]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Insights</h1>

      <div role="tablist" aria-label="Insights tabs" className="insights-tabs">
        <button
          role="tab"
          className={`insights-tab${activeTab === 'country' ? ' insights-tab--active' : ''}`}
          aria-selected={activeTab === "country"}
          onClick={() => setActiveTab("country")}
        >
          Country Analysis
        </button>
        <button
          role="tab"
          className={`insights-tab${activeTab === 'job-title' ? ' insights-tab--active' : ''}`}
          aria-selected={activeTab === "job-title"}
          onClick={() => setActiveTab("job-title")}
        >
          Job Title Analysis
        </button>
        <button
          role="tab"
          className={`insights-tab${activeTab === 'department' ? ' insights-tab--active' : ''}`}
          aria-selected={activeTab === "department"}
          onClick={() => setActiveTab("department")}
        >
          Department Analysis
        </button>
      </div>

      {activeTab === "country" && (
        <section>
          <div className="insights-filter-group" style={{ marginBottom: 16 }}>
            <label htmlFor="country-filter" className="insights-label">Country</label>
            <select
              id="country-filter"
              aria-label="Country"
              className="insights-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {(metaFilters?.countries ?? []).map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </div>

          {countryLoading ? (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : countryStats ? (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard title="Min Salary" value={`$${Math.round(countryStats.min).toLocaleString('en-US')}`} />
              <StatCard title="Max Salary" value={`$${Math.round(countryStats.max).toLocaleString('en-US')}`} />
              <StatCard title="Avg Salary" value={`$${Math.round(countryStats.avg).toLocaleString('en-US')}`} />
            </div>
          ) : null}
          <div className="mt-4">
            <SalaryBarChart
              title="Average Salary by Country"
              data={(countryInsights?.data ?? []).map((x) => ({ name: x.country, value: x.avg_salary }))}
            />
          </div>
        </section>
      )}

      {activeTab === "job-title" && (
        <section className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="insights-filter-group">
              <label htmlFor="job-country-filter" className="insights-label">Country</label>
              <select
                id="job-country-filter"
                aria-label="Country"
                className="insights-select"
                value={selectedJobTitleCountry}
                onChange={(e) => setSelectedJobTitleCountry(e.target.value)}
              >
                <option value="">All Countries</option>
                {(metaFilters?.countries ?? []).map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>
            <div className="insights-filter-group">
              <label htmlFor="job-title-filter" className="insights-label">Job Title</label>
              <select
                id="job-title-filter"
                aria-label="Job Title"
                className="insights-select"
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
              >
                <option value="">All Job Titles</option>
                {(metaFilters?.job_titles ?? []).map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Aggregate stats */}
          {(() => {
            const rows = jobTitleInsights?.data ?? [];
            if (rows.length === 0) return null;
            const min = Math.min(...rows.map((r) => r.min_salary));
            const max = Math.max(...rows.map((r) => r.max_salary));
            const totalSpend = rows.reduce((s, r) => s + r.avg_salary * r.employee_count, 0);
            const totalCount = rows.reduce((s, r) => s + r.employee_count, 0);
            const avg = totalCount > 0 ? totalSpend / totalCount : 0;
            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard title="Min Salary" value={`$${Math.round(min).toLocaleString('en-US')}`} />
                <StatCard title="Max Salary" value={`$${Math.round(max).toLocaleString('en-US')}`} />
                <StatCard title="Avg Salary" value={`$${Math.round(avg).toLocaleString('en-US')}`} />
              </div>
            );
          })()}

          {/* Chart */}
          <SalaryBarChart
            title="Average Salary by Job Title"
            data={(jobTitleInsights?.data ?? []).map((x) => ({ name: x.job_title, value: x.avg_salary }))}
          />
        </section>
      )}

      {activeTab === "department" && (
        <section className="space-y-6">
          {/* Aggregate stats */}
          {(() => {
            const rows = departmentInsights?.data ?? [];
            if (rows.length === 0) return null;
            const min = Math.min(...rows.map((r) => r.avg_salary));
            const max = Math.max(...rows.map((r) => r.avg_salary));
            const totalSpend = rows.reduce((s, r) => s + r.avg_salary * r.employee_count, 0);
            const totalCount = rows.reduce((s, r) => s + r.employee_count, 0);
            const avg = totalCount > 0 ? totalSpend / totalCount : 0;
            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard title="Lowest Dept Avg" value={`$${Math.round(min).toLocaleString('en-US')}`} />
                <StatCard title="Highest Dept Avg" value={`$${Math.round(max).toLocaleString('en-US')}`} />
                <StatCard title="Overall Avg" value={`$${Math.round(avg).toLocaleString('en-US')}`} />
              </div>
            );
          })()}

          {/* Bar chart */}
          <SalaryBarChart
            title="Average Salary by Department"
            data={(departmentInsights?.data ?? []).map((x) => ({ name: x.department, value: x.avg_salary }))}
          />

          {/* Detail cards grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(departmentInsights?.data ?? []).map((x) => (
              <div key={x.department} className="dept-card">
                <p className="dept-card__name">{x.department}</p>
                <p className="dept-card__avg">${Math.round(x.avg_salary).toLocaleString('en-US')} avg</p>
                <p className="dept-card__meta">{x.employee_count.toLocaleString('en-US')} employees · ${Math.round(x.total_spend).toLocaleString('en-US')} total</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
