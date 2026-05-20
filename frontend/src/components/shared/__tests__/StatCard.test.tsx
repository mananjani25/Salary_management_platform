import { render, screen } from "@testing-library/react";

import StatCard from "../StatCard";

test("renders_title_and_value", () => {
  render(<StatCard title="Total Employees" value={10000} />);

  expect(screen.getByText(/total employees/i)).toBeInTheDocument();
  expect(screen.getByText("10000")).toBeInTheDocument();
});

test("formats_large_numbers", () => {
  render(<StatCard title="Total Employees" value={10000} />);

  expect(screen.getByText("10,000")).toBeInTheDocument();
});

test("renders_optional_subtitle", () => {
  render(<StatCard title="Total Employees" value={10000} subtitle="Active only" />);

  expect(screen.getByText(/active only/i)).toBeInTheDocument();
});
