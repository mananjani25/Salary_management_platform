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

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
      <div>
        <label htmlFor="full_name">Full Name</label>
        <input id="full_name" aria-label="Full Name" {...register("full_name", { required: "Full name is required", minLength: { value: 2, message: "Must be at least 2 characters" } })} />
        {errors.full_name && <p>{errors.full_name.message}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" aria-label="Email" {...register("email", { required: "Email is required", pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: "Invalid email format" } })} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="job_title">Job Title</label>
        <input id="job_title" aria-label="Job Title" {...register("job_title", { required: "Job title is required" })} />
        {errors.job_title && <p>{errors.job_title.message}</p>}
      </div>

      <div>
        <label htmlFor="department">Department</label>
        <input id="department" aria-label="Department" {...register("department", { required: "Department is required" })} />
        {errors.department && <p>{errors.department.message}</p>}
      </div>

      <div>
        <label htmlFor="country">Country</label>
        <input id="country" aria-label="Country" {...register("country", { required: "Country is required" })} />
        {errors.country && <p>{errors.country.message}</p>}
      </div>

      <div>
        <label htmlFor="salary">Salary</label>
        <input id="salary" aria-label="Salary" type="number" step="0.01" {...register("salary", { required: "Salary is required", min: { value: 0.01, message: "Salary must be greater than 0" }, valueAsNumber: true })} />
        {errors.salary && <p>{errors.salary.message}</p>}
      </div>

      <div>
        <label htmlFor="employment_type">Employment Type</label>
        <input id="employment_type" aria-label="Employment Type" {...register("employment_type", { required: "Employment type is required" })} />
        {errors.employment_type && <p>{errors.employment_type.message}</p>}
      </div>

      <div>
        <label htmlFor="hire_date">Hire Date</label>
        <input id="hire_date" aria-label="Hire Date" type="date" {...register("hire_date", { required: "Hire date is required" })} />
        {errors.hire_date && <p>{errors.hire_date.message}</p>}
      </div>

      {initialData && (
        <div>
          <label htmlFor="status">Status</label>
          <input id="status" aria-label="Status" {...register("status")} />
        </div>
      )}

      <input type="hidden" {...register("currency")} />

      <div className="flex gap-2">
        <button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Submit"}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

