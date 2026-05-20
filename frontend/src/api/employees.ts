import apiClient from "@/lib/apiClient";
import type {
  Employee,
  EmployeeCreate,
  EmployeeListParams,
  EmployeePatch,
  EmployeeUpdate,
  PaginatedResponse,
} from "@/types/employee";

export async function listEmployees(
  params: EmployeeListParams = {},
): Promise<PaginatedResponse<Employee>> {
  const query = {
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    q: params.search ?? "",
    country: params.country ?? "",
    department: params.department ?? "",
    job_title: params.job_title ?? "",
    status: params.status ?? "",
    sort_by: params.sort_by ?? "full_name",
    sort_order: params.sort_order ?? "asc",
  };
  const { data } = await apiClient.get<PaginatedResponse<Employee>>("/employees", { params: query });
  return data;
}

export async function getEmployee(id: number): Promise<Employee> {
  const { data } = await apiClient.get<Employee>(`/employees/${id}`);
  return data;
}

export async function createEmployee(payload: EmployeeCreate): Promise<Employee> {
  const { data } = await apiClient.post<Employee>("/employees", payload);
  return data;
}

export async function updateEmployee(id: number, payload: EmployeeUpdate): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(`/employees/${id}`, payload);
  return data;
}

export async function patchEmployee(id: number, payload: EmployeePatch): Promise<Employee> {
  const { data } = await apiClient.patch<Employee>(`/employees/${id}`, payload);
  return data;
}

export async function deleteEmployee(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/employees/${id}`);
  return data;
}
