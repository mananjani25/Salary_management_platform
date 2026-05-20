import { render, screen, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";

import DashboardPage from "../page";
import { server } from "../../mocks/server";

test("renders_four_stat_cards", async () => {
  render(<DashboardPage />);

  await waitFor(() => {
    expect(screen.getAllByTestId("stat-card")).toHaveLength(4);
  });
});

test("total_employees_stat_shows_value", async () => {
  render(<DashboardPage />);

  expect(await screen.findByText("5")).toBeInTheDocument();
});

test("avg_salary_formatted_as_currency", async () => {
  render(<DashboardPage />);

  expect(await screen.findByText("$80,250")).toBeInTheDocument();
});

test("renders_salary_by_country_chart", async () => {
  render(<DashboardPage />);

  expect(await screen.findByTestId("salary-by-country-chart")).toBeInTheDocument();
});

test("renders_salary_distribution_chart", async () => {
  render(<DashboardPage />);

  expect(await screen.findByTestId("salary-distribution-chart")).toBeInTheDocument();
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

  render(<DashboardPage />);

  expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
});
