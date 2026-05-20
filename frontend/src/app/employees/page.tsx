"use client";

import { useMemo, useState } from "react";
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

  const { data: listData } = useQuery({
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

  const exportRows = useMemo(() => listData?.data ?? [], [listData]);

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  function handleClearAll() {
    setFilters({
      page: 1,
      page_size: filters.page_size ?? 20,
      search: "",
      country: "",
      department: "",
      job_title: "",
      status: "",
      sort_by: "full_name",
      sort_order: "asc",
    });
  }

  function exportCsv() {
    const headers = [
      "Employee ID",
      "Full Name",
      "Job Title",
      "Department",
      "Country",
      "Salary",
      "Status",
      "Hire Date",
    ];

    const rows = exportRows.map((x) => [
      x.employee_id,
      x.full_name,
      x.job_title,
      x.department,
      x.country,
      String(x.salary),
      x.status,
      x.hire_date,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employees.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <div className="flex gap-2">
          <button type="button" onClick={exportCsv}>Export CSV</button>
          <button type="button" onClick={() => setShowAddForm(true)}>Add Employee</button>
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

      <EmployeeTable filters={filters} onAddEmployee={() => setShowAddForm(true)} />

      <Pagination
        page={listData?.pagination.page ?? 1}
        totalPages={listData?.pagination.total_pages ?? 1}
        pageSize={listData?.pagination.page_size ?? 20}
        total={listData?.pagination.total ?? 0}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        onPageSizeChange={(size) => setFilters((prev) => ({ ...prev, page_size: size, page: 1 }))}
      />

      {showAddForm && (
        <div role="dialog" aria-label="Add employee dialog">
          <EmployeeForm
            onSubmit={(payload) => createMutation.mutate(payload)}
            onCancel={() => setShowAddForm(false)}
            isLoading={createMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}
