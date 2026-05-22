import { http, HttpResponse } from "msw";

import type { Employee, PaginatedResponse } from "../types/employee";
import type {
  CountryInsight,
  DepartmentInsight,
  DistributionBucket,
  JobTitleInsight,
  MetaFilters,
  SummaryStats,
} from "../types/insights";

const API_BASE = "http://localhost:8000/api/v1";

const mockEmployees: Employee[] = [
  {
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
  },
  {
    id: 2,
    employee_id: "EMP-00002",
    full_name: "Rahul Mehta",
    email: "rahul.mehta@example.com",
    job_title: "Data Analyst",
    department: "Engineering",
    country: "India",
    salary: 42000,
    currency: "USD",
    employment_type: "Full-time",
    status: "Active",
    hire_date: "2020-09-01",
    created_at: "2024-01-10T10:00:00",
    updated_at: "2024-01-10T10:00:00",
  },
  {
    id: 3,
    employee_id: "EMP-00003",
    full_name: "Emma Clarke",
    email: "emma.clarke@example.com",
    job_title: "Product Manager",
    department: "Product",
    country: "United Kingdom",
    salary: 98000,
    currency: "USD",
    employment_type: "Full-time",
    status: "Active",
    hire_date: "2019-06-20",
    created_at: "2024-01-10T10:00:00",
    updated_at: "2024-01-10T10:00:00",
  },
  {
    id: 4,
    employee_id: "EMP-00004",
    full_name: "Lucas Gomez",
    email: "lucas.gomez@example.com",
    job_title: "Marketing Manager",
    department: "Marketing",
    country: "Brazil",
    salary: 53000,
    currency: "USD",
    employment_type: "Contract",
    status: "Inactive",
    hire_date: "2018-11-03",
    created_at: "2024-01-10T10:00:00",
    updated_at: "2024-01-10T10:00:00",
  },
  {
    id: 5,
    employee_id: "EMP-00005",
    full_name: "Sophia Nguyen",
    email: "sophia.nguyen@example.com",
    job_title: "UX Designer",
    department: "Design",
    country: "Canada",
    salary: 76000,
    currency: "USD",
    employment_type: "Part-time",
    status: "Active",
    hire_date: "2022-01-15",
    created_at: "2024-01-10T10:00:00",
    updated_at: "2024-01-10T10:00:00",
  },
];

const summary: SummaryStats = {
  total_employees: 4,
  active_employees: 4,
  total_salary_spend: 321000,
  global_min_salary: 42000,
  global_max_salary: 105000,
  global_avg_salary: 80250,
  median_salary: 87000,
};

const countryInsights: CountryInsight[] = [
  { country: "United States", employee_count: 1, min_salary: 105000, max_salary: 105000, avg_salary: 105000, median_salary: 105000, total_spend: 105000 },
  { country: "India", employee_count: 1, min_salary: 42000, max_salary: 42000, avg_salary: 42000, median_salary: 42000, total_spend: 42000 },
  { country: "United Kingdom", employee_count: 1, min_salary: 98000, max_salary: 98000, avg_salary: 98000, median_salary: 98000, total_spend: 98000 },
  { country: "Canada", employee_count: 1, min_salary: 76000, max_salary: 76000, avg_salary: 76000, median_salary: 76000, total_spend: 76000 },
];

const jobTitleInsights: JobTitleInsight[] = [
  { job_title: "Software Engineer", country: "United States", employee_count: 1, min_salary: 105000, max_salary: 105000, avg_salary: 105000 },
  { job_title: "Data Analyst", country: "India", employee_count: 1, min_salary: 42000, max_salary: 42000, avg_salary: 42000 },
  { job_title: "Product Manager", country: "United Kingdom", employee_count: 1, min_salary: 98000, max_salary: 98000, avg_salary: 98000 },
  { job_title: "UX Designer", country: "Canada", employee_count: 1, min_salary: 76000, max_salary: 76000, avg_salary: 76000 },
];

const departmentInsights: DepartmentInsight[] = [
  { department: "Engineering", employee_count: 2, avg_salary: 73500, total_spend: 147000 },
  { department: "Product", employee_count: 1, avg_salary: 98000, total_spend: 98000 },
  { department: "Design", employee_count: 1, avg_salary: 76000, total_spend: 76000 },
];

const distribution: DistributionBucket[] = [
  { range: "0-25k", count: 0 },
  { range: "25k-50k", count: 1 },
  { range: "50k-75k", count: 0 },
  { range: "75k-100k", count: 2 },
  { range: "100k-150k", count: 1 },
  { range: "150k+", count: 0 },
];

const metaFilters: MetaFilters = {
  countries: ["United States", "India", "United Kingdom", "Canada", "Brazil"],
  departments: ["Engineering", "Product", "Design", "Marketing"],
  job_titles: ["Software Engineer", "Data Analyst", "Product Manager", "UX Designer", "Marketing Manager"],
  employment_types: ["Full-time", "Part-time", "Contract"],
  statuses: ["Active", "Inactive"],
};

export const handlers = [
  http.get(`${API_BASE}/employees`, () => {
    const activeEmployees = mockEmployees.filter((e) => e.status === "Active");
    const response: PaginatedResponse<Employee> = {
      data: activeEmployees,
      pagination: { page: 1, page_size: 20, total: activeEmployees.length, total_pages: 1 },
    };
    return HttpResponse.json(response);
  }),
  http.post(`${API_BASE}/employees`, async ({ request }) => {
    const body = (await request.json()) as Partial<Employee>;
    const created: Employee = {
      ...mockEmployees[0],
      ...body,
      id: 99,
      employee_id: "EMP-00099",
      created_at: "2024-01-10T10:00:00",
      updated_at: "2024-01-10T10:00:00",
    } as Employee;
    return HttpResponse.json(created, { status: 201 });
  }),
  http.get(`${API_BASE}/employees/:id`, ({ params }) => {
    const found = mockEmployees.find((e) => e.id === Number(params.id));
    return HttpResponse.json(found ?? mockEmployees[0]);
  }),
  http.put(`${API_BASE}/employees/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Partial<Employee>;
    const found = mockEmployees.find((e) => e.id === Number(params.id)) ?? mockEmployees[0];
    return HttpResponse.json({ ...found, ...body, updated_at: "2024-01-10T12:00:00" });
  }),
  http.patch(`${API_BASE}/employees/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Partial<Employee>;
    const found = mockEmployees.find((e) => e.id === Number(params.id)) ?? mockEmployees[0];
    return HttpResponse.json({ ...found, ...body, updated_at: "2024-01-10T12:00:00" });
  }),
  http.get(`${API_BASE}/insights/summary`, () => HttpResponse.json(summary)),
  http.get(`${API_BASE}/insights/by-country`, ({ request }) => {
    const url = new URL(request.url);
    const country = url.searchParams.get("country") ?? "";
    const data = country ? countryInsights.filter((c) => c.country === country) : countryInsights;
    return HttpResponse.json({ data });
  }),
  http.get(`${API_BASE}/insights/by-job-title`, ({ request }) => {
    const url = new URL(request.url);
    const country = url.searchParams.get("country") ?? "";
    const jobTitle = url.searchParams.get("job_title") ?? "";
    let data = jobTitleInsights;
    if (country) data = data.filter((x) => x.country === country);
    if (jobTitle) data = data.filter((x) => x.job_title === jobTitle);
    return HttpResponse.json({ data });
  }),
  http.get(`${API_BASE}/insights/by-department`, () => HttpResponse.json({ data: departmentInsights })),
  http.get(`${API_BASE}/insights/salary-distribution`, () => HttpResponse.json({ buckets: distribution })),
  http.get(`${API_BASE}/insights/top-paid`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const activeSorted = mockEmployees.filter((e) => e.status === "Active").sort((a, b) => b.salary - a.salary);
    return HttpResponse.json({ data: activeSorted.slice(0, limit) });
  }),
  http.get(`${API_BASE}/meta/filters`, () => HttpResponse.json(metaFilters)),
  http.delete(`${API_BASE}/employees/:id`, () => HttpResponse.json({ message: "Employee deactivated" })),
];

