export interface SummaryStats {
  total_employees: number;
  active_employees: number;
  total_salary_spend: number;
  global_min_salary: number;
  global_max_salary: number;
  global_avg_salary: number;
  median_salary: number;
}

export interface CountryInsight {
  country: string;
  employee_count: number;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  median_salary: number;
  total_spend: number;
}

export interface JobTitleInsight {
  job_title: string;
  country: string;
  employee_count: number;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
}

export interface DepartmentInsight {
  department: string;
  employee_count: number;
  avg_salary: number;
  total_spend: number;
}

export interface DistributionBucket {
  range: string;
  count: number;
}

export interface MetaFilters {
  countries: string[];
  departments: string[];
  job_titles: string[];
  employment_types: string[];
  statuses: string[];
}
