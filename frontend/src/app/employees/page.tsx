"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createEmployee, listEmployees } from "@/api/employees";
import { getMetaFilters } from "@/api/insights";
import EmployeeFilters from "@/components/employees/EmployeeFilters";
import EmployeeForm from "@/components/employees/EmployeeForm";
import EmployeeTable from "@/components/employees/EmployeeTable";
import Pagination from "@/components/shared/Pagination";
import type { EmployeeListParams } from "@/types/employee";

export default function EmployeesPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<EmployeeListParams>({
    page: 1,
    page_size: 20,
    search: "",
    country: "",
    department: "",
    job_title: "",
    status: "",
    sort_by: "full_name",
    sort_order: "asc",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: metaFilters } = useQuery({
    queryKey: ["meta-filters"],
    queryFn: getMetaFilters,
  });

  const { data: listData, isLoading: listLoading, refetch: refetchEmployees } = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => listEmployees(filters),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created");
      setShowAddForm(false);
    },
  });


  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters((prev) => ({
      page: 1,
      page_size: prev.page_size ?? 20,
      search: "",
      country: "",
      department: "",
      job_title: "",
      status: "",
      sort_by: "full_name",
      sort_order: "asc",
    }));
  }, []);

  async function exportCsv() {
    const toastId = toast.loading("Preparing export…");
    try {
      const EXPORT_PAGE_SIZE = 100; // backend max is 100

      // Fetch first page to discover total_pages
      const firstPage = await listEmployees({ ...filters, page: 1, page_size: EXPORT_PAGE_SIZE });
      const totalPages = firstPage.pagination.total_pages;

      // Fetch all remaining pages in parallel
      const remainingPages =
        totalPages > 1
          ? await Promise.all(
              Array.from({ length: totalPages - 1 }, (_, i) =>
                listEmployees({ ...filters, page: i + 2, page_size: EXPORT_PAGE_SIZE })
              )
            )
          : [];

      const allRows = [firstPage, ...remainingPages].flatMap((p) => p.data);

      const headers = [
        "Employee ID",
        "Full Name",
        "Job Title",
        "Department",
        "Employment Type",
        "Country",
        "Salary",
        "Status",
        "Hire Date",
        "Email",
      ];

      const rows = allRows.map((x) => [
        x.employee_id,
        x.full_name,
        x.job_title,
        x.department,
        x.employment_type,
        x.country,
        x.salary,        // plain number — no $ symbol so Excel reads it cleanly
        x.status,
        x.hire_date,
        x.email ?? "",
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
            .join(",")
        )
        .join("\r\n"); // CRLF — RFC 4180 + Excel on Windows

      // UTF-8 BOM tells Excel to open as UTF-8 (fixes #### and garbled chars)
      const bom = "\uFEFF";
      const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "employees.csv";
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${allRows.length} employee${allRows.length !== 1 ? "s" : ""}`, { id: toastId });
    } catch {
      toast.error("Export failed. Please try again.", { id: toastId });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <div className="flex gap-2">
          <button type="button" className="btn btn--secondary" onClick={exportCsv}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button type="button" className="btn btn--primary" onClick={() => setShowAddForm(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Employee
          </button>
        </div>
      </div>

      {metaFilters && (
        <EmployeeFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAll}
          metaFilters={metaFilters}
        />
      )}

      <EmployeeTable
        filters={filters}
        employees={listData?.data ?? []}
        isLoading={listLoading}
        onRefresh={refetchEmployees}
        onAddEmployee={() => setShowAddForm(true)}
      />

      <Pagination
        page={listData?.pagination.page ?? 1}
        totalPages={listData?.pagination.total_pages ?? 1}
        pageSize={listData?.pagination.page_size ?? 20}
        total={listData?.pagination.total ?? 0}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        onPageSizeChange={(size) => setFilters((prev) => ({ ...prev, page_size: size, page: 1 }))}
      />

      {showAddForm && (
        <EmployeeForm
          onSubmit={(payload) => createMutation.mutate(payload)}
          onCancel={() => setShowAddForm(false)}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}
