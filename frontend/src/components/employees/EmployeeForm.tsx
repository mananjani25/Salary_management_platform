"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { Employee, EmployeeCreate } from "@/types/employee";

type EmployeeFormProps = {
  initialData?: Employee;
  onSubmit: (data: EmployeeCreate) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export default function EmployeeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeCreate>({
    defaultValues: {
      full_name: "",
      email: "",
      job_title: "",
      department: "",
      country: "",
      salary: 0,
      currency: "USD",
      employment_type: "",
      status: "Active",
      hire_date: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        full_name: initialData.full_name,
        email: initialData.email,
        job_title: initialData.job_title,
        department: initialData.department,
        country: initialData.country,
        salary: initialData.salary,
        currency: initialData.currency,
        employment_type: initialData.employment_type,
        status: initialData.status,
        hire_date: initialData.hire_date,
      });
    }
  }, [initialData, reset]);

  const isEdit = Boolean(initialData);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit employee dialog" : "Add employee dialog"}>
        <div className="modal__header">
          <h2 className="modal__title">{isEdit ? `Edit – ${initialData?.full_name}` : 'Add New Employee'}</h2>
          <button type="button" className="modal__close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data))}>
          <div className="modal__body">
            <div className="form-grid">

              {/* Full Name */}
              <div className="form-group form-group--full">
                <label className="form-label" htmlFor="full_name">Full Name</label>
                <input
                  id="full_name"
                  aria-label="Full Name"
                  className="form-control"
                  placeholder="Jane Smith"
                  {...register("full_name", { required: "Full name is required", minLength: { value: 2, message: "Must be at least 2 characters" } })}
                />
                {errors.full_name && <p className="form-error">{errors.full_name.message}</p>}
              </div>

              {/* Email */}
              <div className="form-group form-group--full">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  aria-label="Email"
                  className="form-control"
                  placeholder="jane@company.com"
                  {...register("email", { required: "Email is required", pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: "Invalid email format" } })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              {/* Job Title */}
              <div className="form-group">
                <label className="form-label" htmlFor="job_title">Job Title</label>
                <input
                  id="job_title"
                  aria-label="Job Title"
                  className="form-control"
                  placeholder="Software Engineer"
                  {...register("job_title", { required: "Job title is required" })}
                />
                {errors.job_title && <p className="form-error">{errors.job_title.message}</p>}
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label" htmlFor="department">Department</label>
                <input
                  id="department"
                  aria-label="Department"
                  className="form-control"
                  placeholder="Engineering"
                  {...register("department", { required: "Department is required" })}
                />
                {errors.department && <p className="form-error">{errors.department.message}</p>}
              </div>

              {/* Country */}
              <div className="form-group">
                <label className="form-label" htmlFor="country">Country</label>
                <input
                  id="country"
                  aria-label="Country"
                  className="form-control"
                  placeholder="United States"
                  {...register("country", { required: "Country is required" })}
                />
                {errors.country && <p className="form-error">{errors.country.message}</p>}
              </div>

              {/* Salary */}
              <div className="form-group">
                <label className="form-label" htmlFor="salary">Salary (USD)</label>
                <input
                  id="salary"
                  aria-label="Salary"
                  className="form-control"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="75000"
                  {...register("salary", { required: "Salary is required", min: { value: 0.01, message: "Must be greater than 0" }, valueAsNumber: true })}
                />
                {errors.salary && <p className="form-error">{errors.salary.message}</p>}
              </div>

              {/* Employment Type */}
              <div className="form-group">
                <label className="form-label" htmlFor="employment_type">Employment Type</label>
                <select
                  id="employment_type"
                  aria-label="Employment Type"
                  className="form-control"
                  {...register("employment_type", { required: "Employment type is required" })}
                >
                  <option value="">Select type…</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
                {errors.employment_type && <p className="form-error">{errors.employment_type.message}</p>}
              </div>

              {/* Hire Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="hire_date">Hire Date</label>
                <input
                  id="hire_date"
                  aria-label="Hire Date"
                  className="form-control"
                  type="date"
                  {...register("hire_date", { required: "Hire date is required" })}
                />
                {errors.hire_date && <p className="form-error">{errors.hire_date.message}</p>}
              </div>

              {/* Status – edit mode only */}
              {isEdit && (
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select id="status" aria-label="Status" className="form-control" {...register("status")}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

            </div>
          </div>

          <input type="hidden" {...register("currency")} />

          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
