from datetime import date

import pytest

from app.models.employee import Employee


def _seed_employee(test_db, **kwargs):
    employee = Employee(
        employee_id=kwargs["employee_id"],
        full_name=kwargs["full_name"],
        email=kwargs["email"],
        job_title=kwargs["job_title"],
        department=kwargs["department"],
        country=kwargs["country"],
        salary=kwargs["salary"],
        currency="USD",
        employment_type="Full-time",
        status=kwargs.get("status", "Active"),
        hire_date=kwargs.get("hire_date", date(2024, 1, 1)),
    )
    test_db.add(employee)


def _get_country_row(data, country):
    return next((x for x in data if x["country"] == country), None)


def _get_department_row(data, department):
    return next((x for x in data if x["department"] == department), None)


def _all_active_salaries():
    return [30000, 50000, 70000, 90000, 110000, 40000]


@pytest.fixture
def analytics_db(test_db):
    controlled = [
        dict(employee_id="EMP-10001", full_name="IN 1", email="in1@example.com", job_title="Software Engineer", department="Engineering", country="India", salary=30000, status="Active"),
        dict(employee_id="EMP-10002", full_name="IN 2", email="in2@example.com", job_title="Software Engineer", department="Engineering", country="India", salary=50000, status="Active"),
        dict(employee_id="EMP-10003", full_name="IN 3", email="in3@example.com", job_title="Software Engineer", department="Engineering", country="India", salary=70000, status="Active"),
        dict(employee_id="EMP-10004", full_name="US 1", email="us1@example.com", job_title="Product Manager", department="Product", country="United States", salary=90000, status="Active"),
        dict(employee_id="EMP-10005", full_name="US 2", email="us2@example.com", job_title="Product Manager", department="Product", country="United States", salary=110000, status="Active"),
        dict(employee_id="EMP-10006", full_name="IN 4", email="in4@example.com", job_title="Data Analyst", department="Engineering", country="India", salary=40000, status="Active"),
        dict(employee_id="EMP-10007", full_name="US 3", email="us3@example.com", job_title="Product Manager", department="Product", country="United States", salary=120000, status="Inactive"),
    ]

    for row in controlled:
        _seed_employee(test_db, **row)

    test_db.commit()
    return test_db


def test_summary_total_employees_excludes_inactive(client, analytics_db):
    response = client.get("/api/v1/insights/summary")
    assert response.json()["total_employees"] == 6


def test_summary_active_employees_count(client, analytics_db):
    response = client.get("/api/v1/insights/summary")
    assert response.json()["active_employees"] == 6


def test_summary_global_avg_salary_correct(client, analytics_db):
    response = client.get("/api/v1/insights/summary")
    expected = sum(_all_active_salaries()) / 6
    assert abs(response.json()["global_avg_salary"] - expected) < 0.01


def test_summary_excludes_inactive_from_avg(client, analytics_db):
    response = client.get("/api/v1/insights/summary")
    avg_without_inactive = sum(_all_active_salaries()) / 6
    assert abs(response.json()["global_avg_salary"] - avg_without_inactive) < 0.01


def test_by_country_returns_entry_per_country(client, analytics_db):
    response = client.get("/api/v1/insights/by-country")
    countries = {item["country"] for item in response.json()["data"]}
    assert "India" in countries
    assert "United States" in countries


def test_by_country_india_min_salary(client, analytics_db):
    response = client.get("/api/v1/insights/by-country")
    india = _get_country_row(response.json()["data"], "India")
    assert india["min_salary"] == 30000


def test_by_country_india_max_salary(client, analytics_db):
    response = client.get("/api/v1/insights/by-country")
    india = _get_country_row(response.json()["data"], "India")
    assert india["max_salary"] == 70000


def test_by_country_india_avg_salary(client, analytics_db):
    response = client.get("/api/v1/insights/by-country")
    india = _get_country_row(response.json()["data"], "India")
    assert india["avg_salary"] == 47500


def test_by_country_filter_param(client, analytics_db):
    response = client.get("/api/v1/insights/by-country?country=India")
    data = response.json()["data"]
    assert len(data) > 0
    assert all(item["country"] == "India" for item in data)


def test_by_job_title_software_engineer_avg(client, analytics_db):
    response = client.get("/api/v1/insights/by-job-title?job_title=Software Engineer")
    data = response.json()["data"]
    assert len(data) > 0
    assert abs(data[0]["avg_salary"] - ((30000 + 50000 + 70000) / 3)) < 0.01


def test_by_job_title_filtered_by_country(client, analytics_db):
    response = client.get("/api/v1/insights/by-job-title?country=India&job_title=Software Engineer")
    data = response.json()["data"]
    assert len(data) > 0
    assert all(item["country"] == "India" for item in data)


def test_by_department_engineering_count(client, analytics_db):
    response = client.get("/api/v1/insights/by-department")
    eng = _get_department_row(response.json()["data"], "Engineering")
    assert eng["employee_count"] == 4


def test_salary_distribution_all_buckets_sum_equals_active_total(client, analytics_db):
    response = client.get("/api/v1/insights/salary-distribution")
    total = sum(bucket["count"] for bucket in response.json()["buckets"])
    assert total == 6


def test_top_paid_sorted_descending(client, analytics_db):
    response = client.get("/api/v1/insights/top-paid")
    data = response.json()["data"]
    assert data[0]["salary"] >= data[-1]["salary"]


def test_top_paid_limit_param(client, analytics_db):
    response = client.get("/api/v1/insights/top-paid?limit=3")
    assert len(response.json()["data"]) == 3


def test_meta_filters_countries_not_empty(client, analytics_db):
    response = client.get("/api/v1/meta/filters")
    assert isinstance(response.json()["countries"], list)
    assert len(response.json()["countries"]) > 0


def test_meta_filters_includes_all_known_types(client, analytics_db):
    response = client.get("/api/v1/meta/filters")
    employment_types = response.json()["employment_types"]
    assert "Full-time" in employment_types
    assert "Part-time" in employment_types
    assert "Contract" in employment_types
