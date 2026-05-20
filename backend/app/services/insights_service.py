import math
from statistics import median

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.constants import EMPLOYMENT_TYPES, STATUSES
from app.models.employee import Employee


def _to_float(value, default=0.0):
    return round(float(value), 2) if value is not None else default


def get_summary(db: Session) -> dict:
    total_employees = db.query(func.count(Employee.id)).scalar() or 0

    active_q = db.query(Employee).filter(Employee.status == "Active")
    active_employees = active_q.count()

    total_salary_spend, global_min_salary, global_max_salary, global_avg_salary = (
        db.query(
            func.sum(Employee.salary),
            func.min(Employee.salary),
            func.max(Employee.salary),
            func.avg(Employee.salary),
        )
        .filter(Employee.status == "Active")
        .one()
    )

    salaries = [float(s[0]) for s in db.query(Employee.salary).filter(Employee.status == "Active").order_by(Employee.salary.asc()).all()]
    median_salary = round(float(median(salaries)), 2) if salaries else 0.0

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "total_salary_spend": _to_float(total_salary_spend),
        "global_min_salary": _to_float(global_min_salary),
        "global_max_salary": _to_float(global_max_salary),
        "global_avg_salary": _to_float(global_avg_salary),
        "median_salary": median_salary,
    }


def get_by_country(db: Session, country: str | None = None) -> dict:
    query = (
        db.query(
            Employee.country,
            func.count(Employee.id).label("employee_count"),
            func.min(Employee.salary).label("min_salary"),
            func.max(Employee.salary).label("max_salary"),
            func.avg(Employee.salary).label("avg_salary"),
            func.sum(Employee.salary).label("total_spend"),
        )
        .filter(Employee.status == "Active")
    )

    if country:
        query = query.filter(Employee.country == country)

    rows = query.group_by(Employee.country).all()

    data = []
    for row in rows:
        salaries = [
            float(s[0])
            for s in db.query(Employee.salary)
            .filter(Employee.status == "Active", Employee.country == row.country)
            .order_by(Employee.salary.asc())
            .all()
        ]
        data.append(
            {
                "country": row.country,
                "employee_count": row.employee_count,
                "min_salary": _to_float(row.min_salary),
                "max_salary": _to_float(row.max_salary),
                "avg_salary": _to_float(row.avg_salary),
                "median_salary": round(float(median(salaries)), 2) if salaries else 0.0,
                "total_spend": _to_float(row.total_spend),
            }
        )

    return {"data": data}


def get_by_job_title(db: Session, country: str | None = None, job_title: str | None = None) -> dict:
    query = (
        db.query(
            Employee.job_title,
            Employee.country,
            func.count(Employee.id).label("employee_count"),
            func.min(Employee.salary).label("min_salary"),
            func.max(Employee.salary).label("max_salary"),
            func.avg(Employee.salary).label("avg_salary"),
        )
        .filter(Employee.status == "Active")
    )

    if country:
        query = query.filter(Employee.country == country)
    if job_title:
        query = query.filter(Employee.job_title == job_title)

    rows = query.group_by(Employee.job_title, Employee.country).all()

    return {
        "data": [
            {
                "job_title": row.job_title,
                "country": row.country,
                "employee_count": row.employee_count,
                "min_salary": _to_float(row.min_salary),
                "max_salary": _to_float(row.max_salary),
                "avg_salary": _to_float(row.avg_salary),
            }
            for row in rows
        ]
    }


def get_by_department(db: Session) -> dict:
    rows = (
        db.query(
            Employee.department,
            func.count(Employee.id).label("employee_count"),
            func.avg(Employee.salary).label("avg_salary"),
            func.sum(Employee.salary).label("total_spend"),
        )
        .filter(Employee.status == "Active")
        .group_by(Employee.department)
        .all()
    )

    return {
        "data": [
            {
                "department": row.department,
                "employee_count": row.employee_count,
                "avg_salary": _to_float(row.avg_salary),
                "total_spend": _to_float(row.total_spend),
            }
            for row in rows
        ]
    }


def get_salary_distribution(db: Session, country: str | None = None, job_title: str | None = None) -> dict:
    query = db.query(Employee.salary).filter(Employee.status == "Active")

    if country:
        query = query.filter(Employee.country == country)
    if job_title:
        query = query.filter(Employee.job_title == job_title)

    salaries = [float(s[0]) for s in query.all()]

    buckets = {
        "0-25k": 0,
        "25k-50k": 0,
        "50k-75k": 0,
        "75k-100k": 0,
        "100k-150k": 0,
        "150k+": 0,
    }

    for salary in salaries:
        if salary < 25000:
            buckets["0-25k"] += 1
        elif salary < 50000:
            buckets["25k-50k"] += 1
        elif salary < 75000:
            buckets["50k-75k"] += 1
        elif salary < 100000:
            buckets["75k-100k"] += 1
        elif salary < 150000:
            buckets["100k-150k"] += 1
        else:
            buckets["150k+"] += 1

    return {"buckets": [{"range": key, "count": value} for key, value in buckets.items()]}


def get_top_paid(db: Session, limit: int = 10, country: str | None = None, department: str | None = None) -> dict:
    query = db.query(Employee).filter(Employee.status == "Active")

    if country:
        query = query.filter(Employee.country == country)
    if department:
        query = query.filter(Employee.department == department)

    rows = query.order_by(Employee.salary.desc()).limit(limit).all()

    return {
        "data": [
            {
                "id": row.id,
                "employee_id": row.employee_id,
                "full_name": row.full_name,
                "email": row.email,
                "job_title": row.job_title,
                "department": row.department,
                "country": row.country,
                "salary": float(row.salary),
                "currency": row.currency,
                "employment_type": row.employment_type,
                "status": row.status,
                "hire_date": row.hire_date.isoformat(),
                "created_at": row.created_at.isoformat() if row.created_at else None,
                "updated_at": row.updated_at.isoformat() if row.updated_at else None,
            }
            for row in rows
        ]
    }


def get_meta_filters(db: Session) -> dict:
    def distinct_sorted(column):
        return sorted([item[0] for item in db.query(column).distinct().all() if item[0] is not None])

    db_employment_types = set(distinct_sorted(Employee.employment_type))
    db_statuses = set(distinct_sorted(Employee.status))

    return {
        "countries": distinct_sorted(Employee.country),
        "departments": distinct_sorted(Employee.department),
        "job_titles": distinct_sorted(Employee.job_title),
        "employment_types": sorted(db_employment_types.union(set(EMPLOYMENT_TYPES))),
        "statuses": sorted(db_statuses.union(set(STATUSES))),
    }
