import { render, screen, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import DashboardPage from "../page";
import { server } from "../../mocks/server";

function renderDashboard() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>,
  );
}

test("renders_four_stat_cards", async () => {
  renderDashboard();

  await waitFor(() => {
    expect(screen.getAllByTestId("stat-card")).toHaveLength(4);
  });

  expect(screen.getByText("Total Employees")).toBeInTheDocument();
  expect(screen.getByText("Active Employees")).toBeInTheDocument();
  expect(screen.getByText("Average Salary")).toBeInTheDocument();
  expect(screen.getByText("Total Salary Spend")).toBeInTheDocument();
});

test("total_employees_stat_shows_value", async () => {
  renderDashboard();

  expect(await screen.findByText("5 employees")).toBeInTheDocument();
});

test("avg_salary_formatted_as_currency", async () => {
  renderDashboard();

  expect(await screen.findByText("$80,250.00")).toBeInTheDocument();
});

test("renders_salary_by_country_chart", async () => {
  renderDashboard();

  expect(await screen.findByTestId("salary-by-country-chart")).toBeInTheDocument();
  expect(screen.getByText("Salary by Country")).toBeInTheDocument();
});

test("renders_salary_distribution_chart", async () => {
  renderDashboard();

  expect(await screen.findByTestId("salary-distribution-chart")).toBeInTheDocument();
  expect(screen.getByText("Salary Distribution (All Employees)")).toBeInTheDocument();
});

test("shows_skeleton_before_data", async () => {
  server.use(
    http.get("http://localhost:8000/api/v1/insights/summary", async () => {
      await delay(500);
      return HttpResponse.json({
        total_employees: 5,
        active_employees: 4,
        total_salary_spend: 321000,
        global_min_salary: 42000,
        global_max_salary: 105000,
        global_avg_salary: 80250,
        median_salary: 87000,
      });
    }),
  );

  renderDashboard();

  expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
  expect(screen.getAllByTestId("dashboard-stat-skeleton")).toHaveLength(4);
});
