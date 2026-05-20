import argparse
import random
import re
import sys
import time
from datetime import date, timedelta
from pathlib import Path

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text

from app.constants import COUNTRIES, DEPARTMENTS, EMPLOYMENT_TYPES, JOB_TITLES
from app.database import engine
from app.models.employee import Employee


SALARY_RANGES = {
    "Data Analyst": (25000, 55000),
    "HR Specialist": (25000, 55000),
    "Sales Executive": (25000, 55000),
    "Finance Analyst": (25000, 55000),
    "QA Engineer": (25000, 55000),
    "Software Engineer": (55000, 110000),
    "UX Designer": (55000, 110000),
    "DevOps Engineer": (55000, 110000),
    "Senior Software Engineer": (95000, 185000),
    "Engineering Manager": (95000, 185000),
    "Product Manager": (80000, 160000),
    "Marketing Manager": (80000, 160000),
}

COUNTRY_MULTIPLIERS = {
    "United States": 1.0,
    "United Kingdom": 0.85,
    "Germany": 0.88,
    "Canada": 0.82,
    "Australia": 0.90,
    "Singapore": 0.95,
    "India": 0.35,
    "Brazil": 0.45,
}


def load_names(filepath: str) -> list[str]:
    with open(filepath, "r", encoding="utf-8") as file:
        return [line.strip() for line in file if line.strip()]


def generate_full_name(first: str, last: str) -> str:
    return f"{first} {last}"


def _normalize_name(value: str) -> str:
    normalized = value.lower().replace(" ", "")
    return re.sub(r"[^a-z0-9]", "", normalized)


def generate_email(first: str, last: str, seen_emails: set[str]) -> str:
    first_norm = _normalize_name(first)
    last_norm = _normalize_name(last)
    base = f"{first_norm}.{last_norm}@company.com"

    if base not in seen_emails:
        seen_emails.add(base)
        return base

    suffix = 2
    while True:
        candidate = f"{first_norm}.{last_norm}{suffix}@company.com"
        if candidate not in seen_emails:
            seen_emails.add(candidate)
            return candidate
        suffix += 1


def generate_employee_id(index: int) -> str:
    return f"EMP-{index:05d}"


def generate_salary(job_title: str, country: str) -> float:
    min_range, max_range = SALARY_RANGES.get(job_title, (40000, 90000))
    multiplier = COUNTRY_MULTIPLIERS.get(country, 1.0)
    salary = random.uniform(min_range, max_range) * multiplier
    return round(salary, 2)


def _random_hire_date() -> date:
    start = date(2010, 1, 1)
    end = date(2024, 12, 31)
    delta_days = (end - start).days
    chosen = start + timedelta(days=random.randint(0, delta_days))
    return chosen


def generate_employee_record(index: int, first_names: list[str], last_names: list[str], seen_emails: set[str]) -> dict:
    first = random.choice(first_names)
    last = random.choice(last_names)
    full_name = generate_full_name(first, last)
    email = generate_email(first, last, seen_emails)

    job_title = random.choice(JOB_TITLES)
    department = random.choice(DEPARTMENTS)
    country = random.choice(COUNTRIES)
    salary = generate_salary(job_title, country)
    employment_type = random.choice(EMPLOYMENT_TYPES)
    status = "Inactive" if random.random() < 0.02 else "Active"

    return {
        "employee_id": generate_employee_id(index),
        "full_name": full_name,
        "email": email,
        "job_title": job_title,
        "department": department,
        "country": country,
        "salary": salary,
        "currency": "USD",
        "employment_type": employment_type,
        "status": status,
        "hire_date": _random_hire_date(),
    }


def seed(count: int = 10000, reset: bool = False):
    project_root = Path(__file__).resolve().parents[2]
    first_names_path = project_root / "first_names.txt"
    last_names_path = project_root / "last_names.txt"

    if not first_names_path.exists() or not last_names_path.exists():
        raise FileNotFoundError("Missing first_names.txt or last_names.txt at project root")

    first_names = load_names(str(first_names_path))
    last_names = load_names(str(last_names_path))

    start_time = time.perf_counter()

    with engine.connect() as conn:
        if reset:
            conn.execute(text("DELETE FROM employees"))
            conn.commit()
            conn.execute(text("VACUUM"))

        existing = conn.execute(text("SELECT COUNT(*) FROM employees")).scalar() or 0
        if not reset and existing > 0:
            print("Data already exists. Use --reset to re-seed.")
            return

    seen_emails: set[str] = set()
    records = [generate_employee_record(i + 1, first_names, last_names, seen_emails) for i in range(count)]

    print(f"Seeding {count} employees...")
    batch_size = 500
    with engine.begin() as conn:
        for i in range(0, count, batch_size):
            batch = records[i : i + batch_size]
            conn.execute(Employee.__table__.insert(), batch)

    elapsed = time.perf_counter() - start_time
    print(f"Done. {count} records inserted in {elapsed:.1f}s.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed employee data")
    parser.add_argument("--reset", action="store_true", help="Reset existing employee data before seeding")
    args = parser.parse_args()
    seed(reset=args.reset)

