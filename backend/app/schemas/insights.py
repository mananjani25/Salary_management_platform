from pydantic import BaseModel

from app.schemas.employee import EmployeeResponse


class SummaryResponse(BaseModel):
    total_employees: int
    active_employees: int
    total_salary_spend: float
    global_min_salary: float
    global_max_salary: float
    global_avg_salary: float
    median_salary: float


class CountryInsightItem(BaseModel):
    country: str
    employee_count: int
    min_salary: float
    max_salary: float
    avg_salary: float
    median_salary: float
    total_spend: float


class CountryInsightResponse(BaseModel):
    data: list[CountryInsightItem]


class JobTitleInsightItem(BaseModel):
    job_title: str
    country: str
    employee_count: int
    min_salary: float
    max_salary: float
    avg_salary: float


class JobTitleInsightResponse(BaseModel):
    data: list[JobTitleInsightItem]


class DepartmentInsightItem(BaseModel):
    department: str
    employee_count: int
    avg_salary: float
    total_spend: float


class DepartmentInsightResponse(BaseModel):
    data: list[DepartmentInsightItem]


class DistributionBucket(BaseModel):
    range: str
    count: int


class SalaryDistributionResponse(BaseModel):
    buckets: list[DistributionBucket]


class TopPaidResponse(BaseModel):
    data: list[EmployeeResponse]


class MetaFiltersResponse(BaseModel):
    countries: list[str]
    departments: list[str]
    job_titles: list[str]
    employment_types: list[str]
    statuses: list[str]
