import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import Pagination from "../../shared/Pagination";


test("renders_page_info", () => {
  render(
    <Pagination
      page={1}
      totalPages={50}
      pageSize={20}
      total={1000}
      onPageChange={vi.fn()}
      onPageSizeChange={vi.fn()}
    />,
  );

  expect(screen.getByText(/page 1 of 50|1 of 50/i)).toBeInTheDocument();
});

test("previous_disabled_on_first_page", () => {
  render(
    <Pagination
      page={1}
      totalPages={50}
      pageSize={20}
      total={1000}
      onPageChange={vi.fn()}
      onPageSizeChange={vi.fn()}
    />,
  );

  expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
});

test("next_calls_onPageChange", async () => {
  const onPageChange = vi.fn();

  render(
    <Pagination
      page={1}
      totalPages={50}
      pageSize={20}
      total={1000}
      onPageChange={onPageChange}
      onPageSizeChange={vi.fn()}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: /next/i }));
  expect(onPageChange).toHaveBeenCalledWith(2);
});

test("page_size_change_calls_handler", async () => {
  const onPageSizeChange = vi.fn();

  render(
    <Pagination
      page={1}
      totalPages={50}
      pageSize={20}
      total={1000}
      onPageChange={vi.fn()}
      onPageSizeChange={onPageSizeChange}
    />,
  );

  await userEvent.selectOptions(screen.getByLabelText(/page size/i), "50");
  expect(onPageSizeChange).toHaveBeenCalledWith(50);
});
