"use client";

import { useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { QueryClientContext } from "@tanstack/react-query";

import {
  deleteEmployee,
  listEmployees,
  patchEmployee,
  updateEmployee,
} from "../../api/employees";
import type { Employee, EmployeeListParams } from "../../types/employee";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import EmployeeForm from "./EmployeeForm";

type EmployeeTableProps = {
  filters?: EmployeeListParams;
  onAddEmployee?: () => void;
};

export default function EmployeeTable({ filters = {}, onAddEmployee }: EmployeeTableProps) {
  const queryClient = useContext(QueryClientContext);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [data, setData] = useState<{ data: Employee[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mergedFilters = useMemo(
    () => ({
      page: filters.page ?? 1,
      page_size: filters.page_size ?? 20,
      search: filters.search ?? "",
      country: filters.country ?? "",
      department: filters.department ?? "",
      job_title: filters.job_title ?? "",
      status: filters.status ?? "",
      sort_by: filters.sort_by ?? "full_name",
      sort_order: filters.sort_order ?? "asc",
    }),
    [filters],
  );

  const fetchEmployees = async () => {
    const isFirstLoad = data === null;
    if (isFirstLoad) {
      setIsLoading(true);
    }
    try {
      const response = await listEmployees(mergedFilters);
      setData(response as { data: Employee[] });
    } finally {
      if (isFirstLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchEmployees();
  }, [mergedFilters]);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (payload: Partial<Employee>) => {
    if (!selectedEmployee) return;
    setIsSaving(true);
    try {
      if (payload.email !== selectedEmployee.email) {
        await updateEmployee(selectedEmployee.id, payload as any);
      } else {
        await patchEmployee(selectedEmployee.id, payload as any);
      }
      toast.success("Employee updated");
      setSelectedEmployee(null);
      await queryClient?.invalidateQueries({ queryKey: ["employees"] });
      await fetchEmployees();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(employeeToDelete.id);
      toast.success("Employee deactivated");
      setEmployeeToDelete(null);
      await queryClient?.invalidateQueries({ queryKey: ["employees"] });
      await fetchEmployees();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input placeholder="Search employees" />
        <button type="button" onClick={onAddEmployee}>Add Employee</button>
      </div>

      {selectedEmployee ? null : isLoading ? (
        <div>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} data-testid="employee-row-skeleton" className="h-8 border-b" />
          ))}
        </div>
      ) : data && data.data.length === 0 ? (
        <div className="py-8 text-center">
          <p>No employees found</p>
          <button type="button">Clear Filters</button>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Job Title</th>
              <th>Department</th>
              <th>Country</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Hire Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((employee, index) => (
              <tr key={employee.id}>
                <td>{employee.employee_id}</td>
                <td>{employee.full_name}</td>
                <td>{employee.job_title}</td>
                <td>{employee.department}</td>
                <td>{employee.country}</td>
                <td>{employee.salary.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</td>
                <td>{employee.status}</td>
                <td>{employee.hire_date}</td>
                <td>
                  <button
                    type="button"
                    aria-label={index === 0 ? "Edit" : `Modify ${employee.full_name}`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    {index === 0 ? "Edit" : "Modify"}
                  </button>
                  <button
                    type="button"
                    aria-label={index === 0 ? "Delete" : `Remove ${employee.full_name}`}
                    onClick={() => setEmployeeToDelete(employee)}
                  >
                    {index === 0 ? "Delete" : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedEmployee && (
        <div role="dialog" aria-label="Edit employee dialog">
          <EmployeeForm
            initialData={selectedEmployee}
            onSubmit={handleSave}
            onCancel={() => setSelectedEmployee(null)}
            isLoading={isSaving}
          />
        </div>
      )}

      <DeleteConfirmDialog
        employee={employeeToDelete}
        isOpen={Boolean(employeeToDelete)}
        onCancel={() => setEmployeeToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
