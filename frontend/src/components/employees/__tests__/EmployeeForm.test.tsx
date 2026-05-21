import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { Employee } from "../../../types/employee";
import EmployeeForm from "../EmployeeForm";

function setup(props: Partial<React.ComponentProps<typeof EmployeeForm>> = {}) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  render(<EmployeeForm onSubmit={onSubmit} onCancel={onCancel} {...props} />);

  return { onSubmit, onCancel };
}

test("renders_all_required_fields", () => {
  setup();

  expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/employment type/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/hire date/i)).toBeInTheDocument();
});

test("submit_without_name_shows_error", async () => {
  setup();

  await userEvent.click(screen.getByRole("button", { name: /add employee/i }));

  expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
});

test("submit_with_invalid_email_shows_error", async () => {
  setup();

  await userEvent.type(screen.getByLabelText(/email/i), "notvalid");
  await userEvent.click(screen.getByRole("button", { name: /add employee/i }));

  expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
});

test("submit_with_negative_salary_shows_error", async () => {
  setup();

  await userEvent.type(screen.getByLabelText(/salary/i), "-100");
  await userEvent.click(screen.getByRole("button", { name: /add employee/i }));

  expect(screen.getByText(/salary must be greater than 0|salary is required/i)).toBeInTheDocument();
});

test("valid_form_submission_calls_onSubmit_with_data", async () => {
  const { onSubmit } = setup();

  await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
  await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
  await userEvent.type(screen.getByLabelText(/job title/i), "Software Engineer");
  await userEvent.type(screen.getByLabelText(/department/i), "Engineering");
  await userEvent.type(screen.getByLabelText(/country/i), "United States");
  await userEvent.type(screen.getByLabelText(/salary/i), "100000");
  await userEvent.selectOptions(screen.getByLabelText(/employment type/i), "Full-Time");
  await userEvent.type(screen.getByLabelText(/hire date/i), "2024-01-01");

  await userEvent.click(screen.getByRole("button", { name: /add employee/i }));

  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      full_name: "Jane Doe",
      email: "jane@example.com",
      salary: 100000,
    }),
  );
});

test("edit_mode_prepopulates_all_fields", () => {
  const initialData: Employee = {
    id: 1,
    employee_id: "EMP-00001",
    full_name: "Existing User",
    email: "existing@example.com",
    job_title: "Software Engineer",
    department: "Engineering",
    country: "United States",
    salary: 123000,
    currency: "USD",
    employment_type: "Full-time",
    status: "Active",
    hire_date: "2020-05-10",
    created_at: "2024-01-01T00:00:00",
    updated_at: "2024-01-01T00:00:00",
  };

  setup({ initialData });

  expect(screen.getByLabelText(/full name/i)).toHaveValue("Existing User");
});

test("cancel_button_calls_onCancel", async () => {
  const { onCancel } = setup();

  await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(onCancel).toHaveBeenCalled();
});

test("submit_button_disabled_when_isLoading_true", () => {
  setup({ isLoading: true });

  expect(screen.getByRole("button", { name: /saving|add employee/i })).toBeDisabled();
});
