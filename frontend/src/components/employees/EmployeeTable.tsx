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
  employees?: Employee[];
  isLoading?: boolean;
  onRefresh?: () => Promise<unknown>;
  onAddEmployee?: () => void;
};

export default function EmployeeTable({ filters = {}, employees, isLoading = false, onRefresh, onAddEmployee }: EmployeeTableProps) {
  const queryClient = useContext(QueryClientContext);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [internalData, setInternalData] = useState<{ data: Employee[] } | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);

  const isManagedMode = employees !== undefined;

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
    const isFirstLoad = internalData === null;
    if (isFirstLoad) {
      setInternalLoading(true);
    }
    try {
      const response = await listEmployees(mergedFilters);
      setInternalData(response as { data: Employee[] });
    } finally {
      if (isFirstLoad) {
        setInternalLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isManagedMode) {
      return;
    }
    void fetchEmployees();
  }, [isManagedMode, mergedFilters]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.search || filters.country || filters.department || filters.job_title || filters.status);
  }, [filters.search, filters.country, filters.department, filters.job_title, filters.status]);

  const visibleEmployees = isManagedMode ? employees : (internalData?.data ?? []);
  const tableIsLoading = isManagedMode ? isLoading : internalLoading;

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
      if (isManagedMode) {
        await onRefresh?.();
      } else {
        await fetchEmployees();
      }
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
      if (isManagedMode) {
        await onRefresh?.();
      } else {
        await fetchEmployees();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">

      {selectedEmployee ? null : tableIsLoading ? (
        <div>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} data-testid="employee-row-skeleton" className="h-8 border-b" />
          ))}
        </div>
      ) : visibleEmployees.length === 0 ? (
        <div className="py-8 text-center">
          <p>No employees found</p>
          {hasActiveFilters ? <button type="button">Clear Filters</button> : null}
        </div>
      ) : (
        <div className="employee-table-wrapper">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Job Title</th>
                <th>Department</th>
                <th>Employment Type</th>
                <th>Country</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Hire Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="emp-id">{employee.employee_id}</td>
                  <td className="emp-name">{employee.full_name}</td>
                  <td>{employee.job_title}</td>
                  <td>{employee.department}</td>
                  <td>{employee.employment_type}</td>
                  <td>{employee.country}</td>
                  <td className="emp-salary">{employee.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</td>
                  <td>
                    <span className={`status-badge status-badge--${employee.status.toLowerCase()}`}>{employee.status}</span>
                  </td>
                  <td className="emp-date">{employee.hire_date}</td>
                  <td className="emp-actions">
                    <button
                      type="button"
                      className="btn-icon btn-icon--edit"
                      aria-label={`Edit ${employee.full_name}`}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-icon--danger"
                      aria-label={`Delete ${employee.full_name}`}
                      onClick={() => setEmployeeToDelete(employee)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEmployee && (
        <EmployeeForm
          initialData={selectedEmployee}
          onSubmit={handleSave}
          onCancel={() => setSelectedEmployee(null)}
          isLoading={isSaving}
        />
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
