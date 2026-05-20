from pathlib import Path

from scripts.seed import (
    generate_email,
    generate_employee_id,
    generate_employee_record,
    generate_full_name,
    generate_salary,
    load_names,
)


def test_load_names_reads_file_correctly(tmp_path):
    file_path = tmp_path / "names.txt"
    file_path.write_text("Jane\nJohn\n  Alice  \nBob\nEve\n")

    names = load_names(str(file_path))
    assert names == ["Jane", "John", "Alice", "Bob", "Eve"]


def test_generate_full_name_combines_first_and_last():
    assert generate_full_name("Jane", "Doe") == "Jane Doe"


def test_generate_email_from_name():
    email = generate_email("Jane", "Doe", set())
    assert email == "jane.doe@company.com"


def test_generate_email_handles_spaces_in_name():
    email = generate_email("Mary Jane", "Watson", set())
    assert " " not in email


def test_generate_email_deduplicates():
    seen = {"jane.doe@company.com"}
    email = generate_email("Jane", "Doe", seen)
    assert email == "jane.doe2@company.com"


def test_generate_employee_id_format():
    assert generate_employee_id(1) == "EMP-00001"


def test_generate_employee_id_pads_to_5_digits():
    assert generate_employee_id(42) == "EMP-00042"


def test_generate_employee_id_max():
    assert generate_employee_id(10000) == "EMP-10000"


def test_generate_salary_returns_positive():
    salary = generate_salary("Software Engineer", "India")
    assert salary > 0


def test_generate_salary_india_lower_than_usa():
    india_salary = generate_salary("Software Engineer", "India")
    usa_salary = generate_salary("Software Engineer", "United States")
    assert india_salary < usa_salary


def test_generate_employee_record_has_all_fields():
    record = generate_employee_record(1, ["Jane"], ["Doe"], set())
    keys = {
        "full_name",
        "email",
        "job_title",
        "department",
        "country",
        "salary",
        "currency",
        "employment_type",
        "status",
        "hire_date",
        "employee_id",
    }
    assert keys.issubset(record.keys())


def test_status_distribution_approx_2_percent_inactive():
    records = [generate_employee_record(i + 1, ["Jane"], ["Doe"], set()) for i in range(500)]
    inactive_count = sum(1 for record in records if record["status"] == "Inactive")
    assert 0 < inactive_count < 50
