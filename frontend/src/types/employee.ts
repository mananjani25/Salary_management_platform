export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
  employment_type: string;
  status: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  full_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
  employment_type: string;
  status: string;
  hire_date: string;
}

export type EmployeeUpdate = EmployeeCreate;
export type EmployeePatch = Partial<EmployeeCreate>;

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface EmployeeListParams {
  page?: number;
  page_size?: number;
  search?: string;
  country?: string;
  department?: string;
  job_title?: string;
  status?: string;
  employment_type?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
