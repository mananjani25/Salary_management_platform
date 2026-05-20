from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.constants import COUNTRIES, DEPARTMENTS, EMPLOYMENT_TYPES, JOB_TITLES, STATUSES


class EmployeeBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    job_title: str
    department: str
    country: str
    salary: float = Field(gt=0)
    currency: str = "USD"
    employment_type: str
    status: str = "Active"
    hire_date: date

    @field_validator("job_title")
    @classmethod
    def validate_job_title(cls, value: str) -> str:
        if value not in JOB_TITLES:
            raise ValueError("Invalid job_title")
        return value

    @field_validator("department")
    @classmethod
    def validate_department(cls, value: str) -> str:
        if value not in DEPARTMENTS:
            raise ValueError("Invalid department")
        return value

    @field_validator("country")
    @classmethod
    def validate_country(cls, value: str) -> str:
        if value not in COUNTRIES:
            raise ValueError("Invalid country")
        return value

    @field_validator("employment_type")
    @classmethod
    def validate_employment_type(cls, value: str) -> str:
        if value not in EMPLOYMENT_TYPES:
            raise ValueError("Invalid employment_type")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in STATUSES:
            raise ValueError("Invalid status")
        return value

    @field_validator("hire_date")
    @classmethod
    def validate_hire_date(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("hire_date cannot be in the future")
        return value


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(EmployeeBase):
    pass


class EmployeePatch(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    country: Optional[str] = None
    salary: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = None
    employment_type: Optional[str] = None
    status: Optional[str] = None
    hire_date: Optional[date] = None

    @field_validator("job_title")
    @classmethod
    def validate_patch_job_title(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in JOB_TITLES:
            raise ValueError("Invalid job_title")
        return value

    @field_validator("department")
    @classmethod
    def validate_patch_department(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in DEPARTMENTS:
            raise ValueError("Invalid department")
        return value

    @field_validator("country")
    @classmethod
    def validate_patch_country(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in COUNTRIES:
            raise ValueError("Invalid country")
        return value

    @field_validator("employment_type")
    @classmethod
    def validate_patch_employment_type(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in EMPLOYMENT_TYPES:
            raise ValueError("Invalid employment_type")
        return value

    @field_validator("status")
    @classmethod
    def validate_patch_status(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in STATUSES:
            raise ValueError("Invalid status")
        return value

    @field_validator("hire_date")
    @classmethod
    def validate_patch_hire_date(cls, value: Optional[date]) -> Optional[date]:
        if value is not None and value > date.today():
            raise ValueError("hire_date cannot be in the future")
        return value


class EmployeeResponse(EmployeeBase):
    id: int
    employee_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
