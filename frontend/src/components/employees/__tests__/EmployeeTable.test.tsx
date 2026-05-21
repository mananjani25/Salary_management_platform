import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { server } from "../../../mocks/server";
import EmployeeTable from "../EmployeeTable";


test("renders_column_headers", async () => {
  render(<EmployeeTable />);

  expect(await screen.findByText(/employee id/i)).toBeInTheDocument();
  expect(screen.getByText(/full name/i)).toBeInTheDocument();
  expect(screen.getByText(/job title/i)).toBeInTheDocument();
  expect(screen.getByText(/salary/i)).toBeInTheDocument();
  expect(screen.getByText(/status/i)).toBeInTheDocument();
  expect(screen.getByText(/actions/i)).toBeInTheDocument();
});

test("renders_employee_rows_from_api", async () => {
  render(<EmployeeTable />);

  await waitFor(() => {
    expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    expect(screen.getByText(/Rahul Mehta/i)).toBeInTheDocument();
    expect(screen.getByText(/Emma Clarke/i)).toBeInTheDocument();
  });
});

test("shows_skeleton_while_loading", () => {
  render(<EmployeeTable />);
  expect(screen.getAllByTestId("employee-row-skeleton").length).toBeGreaterThan(0);
});

test("shows_empty_state_when_no_employees", async () => {
  server.use(
    http.get("http://localhost:8000/api/v1/employees", () =>
      HttpResponse.json({
        data: [],
        pagination: { page: 1, page_size: 20, total: 0, total_pages: 0 },
      }),
    ),
  );

  render(<EmployeeTable />);

  expect(await screen.findByText(/no employees found/i)).toBeInTheDocument();
});

test("search_input_renders", () => {
  render(<EmployeeTable />);
  expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
});

test("add_employee_button_renders", () => {
  render(<EmployeeTable />);
  expect(screen.getByRole("button", { name: /add employee/i })).toBeInTheDocument();
});

test("clicking_edit_opens_dialog", async () => {
  render(<EmployeeTable />);

  const editButtons = await screen.findAllByRole("button", { name: /edit/i });
  await userEvent.click(editButtons[0]);

  expect(await screen.findByText(/full name/i)).toBeInTheDocument();
});

test("clicking_delete_opens_confirm_dialog", async () => {
  render(<EmployeeTable />);

  const deleteButtons = await screen.findAllByRole("button", { name: /delete/i });
  await userEvent.click(deleteButtons[0]);

  expect(await screen.findByText(/are you sure/i)).toBeInTheDocument();
});
