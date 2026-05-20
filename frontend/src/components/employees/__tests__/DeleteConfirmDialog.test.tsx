import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { Employee } from "../../../types/employee";
import DeleteConfirmDialog from "../DeleteConfirmDialog";

const mockEmployee: Employee = {
  id: 1,
  employee_id: "EMP-00001",
  full_name: "Alice Johnson",
  email: "alice.johnson@example.com",
  job_title: "Software Engineer",
  department: "Engineering",
  country: "United States",
  salary: 105000,
  currency: "USD",
  employment_type: "Full-time",
  status: "Active",
  hire_date: "2021-04-12",
  created_at: "2024-01-10T10:00:00",
  updated_at: "2024-01-10T10:00:00",
};

test("shows_employee_name_in_dialog", () => {
  render(
    <DeleteConfirmDialog
      employee={mockEmployee}
      isOpen
      onConfirm={vi.fn()}
      onCancel={vi.fn()}
      isLoading={false}
    />,
  );

  expect(screen.getByText(/alice johnson/i)).toBeInTheDocument();
});

test("confirm_calls_onConfirm", async () => {
  const onConfirm = vi.fn();

  render(
    <DeleteConfirmDialog
      employee={mockEmployee}
      isOpen
      onConfirm={onConfirm}
      onCancel={vi.fn()}
      isLoading={false}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: /deactivate|confirm/i }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test("cancel_calls_onCancel", async () => {
  const onCancel = vi.fn();

  render(
    <DeleteConfirmDialog
      employee={mockEmployee}
      isOpen
      onConfirm={vi.fn()}
      onCancel={onCancel}
      isLoading={false}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
  expect(onCancel).toHaveBeenCalledTimes(1);
});

test("confirm_disabled_when_loading", () => {
  render(
    <DeleteConfirmDialog
      employee={mockEmployee}
      isOpen
      onConfirm={vi.fn()}
      onCancel={vi.fn()}
      isLoading
    />,
  );

  expect(screen.getByRole("button", { name: /deactivating|deactivate|confirm/i })).toBeDisabled();
});
