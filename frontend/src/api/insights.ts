import apiClient from "../lib/apiClient";
import type { Employee } from "../types/employee";
import type {
  CountryInsight,
  DepartmentInsight,
  DistributionBucket,
  JobTitleInsight,
  MetaFilters,
  SummaryStats,
} from "../types/insights";

export async function getSummary(): Promise<SummaryStats> {
  const { data } = await apiClient.get<SummaryStats>("/insights/summary");
  return data;
}

export async function getByCountry(country?: string): Promise<{ data: CountryInsight[] }> {
  const { data } = await apiClient.get<{ data: CountryInsight[] }>("/insights/by-country", {
    params: { country: country ?? "" },
  });
  return data;
}

export async function getByJobTitle(country?: string, jobTitle?: string): Promise<{ data: JobTitleInsight[] }> {
  const { data } = await apiClient.get<{ data: JobTitleInsight[] }>("/insights/by-job-title", {
    params: { country: country ?? "", job_title: jobTitle ?? "" },
  });
  return data;
}

export async function getByDepartment(): Promise<{ data: DepartmentInsight[] }> {
  const { data } = await apiClient.get<{ data: DepartmentInsight[] }>("/insights/by-department");
  return data;
}

export async function getSalaryDistribution(
  country?: string,
  jobTitle?: string,
): Promise<{ buckets: DistributionBucket[] }> {
  const { data } = await apiClient.get<{ buckets: DistributionBucket[] }>("/insights/salary-distribution", {
    params: { country: country ?? "", job_title: jobTitle ?? "" },
  });
  return data;
}

export async function getTopPaid(
  limit = 10,
  country?: string,
  department?: string,
): Promise<{ data: Employee[] }> {
  const { data } = await apiClient.get<{ data: Employee[] }>("/insights/top-paid", {
    params: { limit, country: country ?? "", department: department ?? "" },
  });
  return data;
}

export async function getMetaFilters(): Promise<MetaFilters> {
  const { data } = await apiClient.get<MetaFilters>("/meta/filters");
  return data;
}

