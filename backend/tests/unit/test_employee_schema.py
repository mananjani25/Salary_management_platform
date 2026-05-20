from datetime import date, timedelta

import pytest
from pydantic import ValidationError

from app.schemas.employee import EmployeeCreate


def valid_payload() -> dict:
    return {
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "job_title": "Software Engineer",
        "department": "Engineering",
        "country": "United States",
        "salary": 120000,
        "employment_type": "Full-time",
        "hire_date": date.today(),
    }


def test_valid_employee_schema_passes():
    """Valid employee payload should create schema successfully."""
    employee = EmployeeCreate(**valid_payload())
    assert employee.full_name == "John Doe"


def test_full_name_required():
    """Missing full_name should raise a validation error."""
    payload = valid_payload()
    payload.pop("full_name")

    with pytest.raises(ValidationError):
        EmployeeCreate(**payload)


def test_email_required():
    """Missing email should raise a validation error."""
    payload = valid_payload()
    payload.pop("email")

    with pytest.raises(ValidationError):
        EmployeeCreate(**payload)


def test_email_invalid_format():
    """Invalid email format should raise a validation error."""
    payload = valid_payload()
    payload["email"] = "not-an-email"

    with pytest.raises(ValidationError):
        EmployeeCreate(**payload)


def test_salary_must_be_positive():
    """Negative salary should raise a validation error."""
    payload = valid_payload()
    payload["salary"] = -500

    with pytest.raises(ValidationError):
        EmployeeCreate(**payload)


def test_salary_zero_rejected():
    """Zero salary should raise a validation error."""
    payload = valid_payload()
    payload["salary"] = 0

    with pytest.raises(ValidationError):
        EmployeeCreate(**payload)


def test_employment_type_invalid_value():
    """Unsupported employment type should raise a validation error."""
    payload = valid_payload()
    payload["employment_type"] = "Freelance"

    with pytest.raises(ValidationError):
        EmployeeCreate(**payload)


def test_employment_type_valid_values():
    """Allowed employment type values should pass validation."""
    for employment_type in ["Full-time", "Part-time", "Contract"]:
        payload = valid_payload()
        payload["employment_type"] = employment_type
        employee = EmployeeCreate(**payload)
        assert employee.employment_type == employment_type


def test_hire_date_future_rejected():
    """Future hire_date should raise a validation error."""
    payload = valid_payload()
    payload["hire_date"] = date.today() + timedelta(days=1)

    with pytest.raises(ValidationError):
        EmployeeCreate(**payload)


def test_hire_date_today_accepted():
    """Today's hire_date should pass validation."""
    payload = valid_payload()
    payload["hire_date"] = date.today()

    employee = EmployeeCreate(**payload)
    assert employee.hire_date == date.today()


def test_status_defaults_to_active():
    """Status should default to Active when omitted."""
    employee = EmployeeCreate(**valid_payload())
    assert employee.status == "Active"


def test_currency_defaults_to_usd():
    """Currency should default to USD when omitted."""
    employee = EmployeeCreate(**valid_payload())
    assert employee.currency == "USD"
