"use client";

import { useEffect, useState } from "react";

import type { EmployeeListParams } from "@/types/employee";
import type { MetaFilters } from "@/types/insights";

type EmployeeFiltersProps = {
  filters: EmployeeListParams;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
  metaFilters: MetaFilters;
};

export default function EmployeeFilters({
  filters,
  onFilterChange,
  onClearAll,
  metaFilters,
}: EmployeeFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      onFilterChange("search", searchTerm);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchTerm, onFilterChange]);

  const hasActive = Boolean(filters.country || filters.department || filters.job_title || filters.status || searchTerm);

  return (
    <div className="filters-bar">
      <input
        className="form-control"
        placeholder="🔍  Search by name, ID…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select className="form-control" value={filters.country ?? ""} onChange={(e) => onFilterChange("country", e.target.value)}>
        <option value="">All Countries</option>
        {metaFilters.countries.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>

      <select className="form-control" value={filters.department ?? ""} onChange={(e) => onFilterChange("department", e.target.value)}>
        <option value="">All Departments</option>
        {metaFilters.departments.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>

      <select className="form-control" value={filters.job_title ?? ""} onChange={(e) => onFilterChange("job_title", e.target.value)}>
        <option value="">All Job Titles</option>
        {metaFilters.job_titles.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>

      <select className="form-control" value={filters.status ?? ""} onChange={(e) => onFilterChange("status", e.target.value)}>
        <option value="">All Statuses</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>

      {hasActive && (
        <button type="button" className="btn btn--secondary btn--sm" onClick={onClearAll}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}
