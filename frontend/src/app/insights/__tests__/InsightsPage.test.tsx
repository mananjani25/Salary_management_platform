import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import InsightsPage from "../page";

function renderInsightsPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <InsightsPage />
    </QueryClientProvider>,
  );
}

test("renders_three_tab_labels", () => {
  renderInsightsPage();

  expect(screen.getByText(/country analysis/i)).toBeInTheDocument();
  expect(screen.getByText(/job title analysis/i)).toBeInTheDocument();
  expect(screen.getByText(/department analysis/i)).toBeInTheDocument();
});

test("country_tab_active_by_default", async () => {
  renderInsightsPage();

  expect(screen.getByText(/country analysis/i)).toBeInTheDocument();
  expect(await screen.findByText(/min salary/i)).toBeInTheDocument();
});

test("country_tab_shows_min_max_avg_cards", async () => {
  renderInsightsPage();

  await waitFor(() => {
    expect(screen.getByText(/min salary/i)).toBeInTheDocument();
    expect(screen.getByText(/max salary/i)).toBeInTheDocument();
    expect(screen.getByText(/avg salary/i)).toBeInTheDocument();
  });
});

test("country_filter_select_renders", () => {
  renderInsightsPage();

  expect(screen.getByRole("combobox", { name: /country/i })).toBeInTheDocument();
});

test("job_title_tab_renders_on_click", async () => {
  renderInsightsPage();

  await userEvent.click(screen.getByRole("tab", { name: /job title analysis/i }));
  expect(screen.getByText(/job title analysis/i)).toBeInTheDocument();
});

test("job_title_tab_has_country_and_title_filters", async () => {
  renderInsightsPage();

  await userEvent.click(screen.getByRole("tab", { name: /job title analysis/i }));
  expect(screen.getByRole("combobox", { name: /country/i })).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: /job title/i })).toBeInTheDocument();
});

test("department_tab_renders_on_click", async () => {
  renderInsightsPage();

  await userEvent.click(screen.getByRole("tab", { name: /department analysis/i }));
  expect(screen.getByText(/department analysis/i)).toBeInTheDocument();
});
