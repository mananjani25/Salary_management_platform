import math
from statistics import median

from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.constants import EMPLOYMENT_TYPES, STATUSES
from app.models.employee import Employee


def _to_float(value, default=0.0):
    return round(float(value), 2) if value is not None else default


def _calculate_median_salary(db: Session, filters: list = None) -> float:
    query = db.query(func.count(Employee.id)).filter(Employee.status == "Active")
    if filters:
        for f in filters:
            query = query.filter(f)
    count = query.scalar() or 0
    if count == 0:
        return 0.0

    salary_query = (
        db.query(Employee.salary)
        .filter(Employee.status == "Active")
        .order_by(Employee.salary.asc())
    )
    if filters:
        for f in filters:
            salary_query = salary_query.filter(f)

    if count % 2 == 1:
        val = salary_query.offset(count // 2).limit(1).scalar()
        return round(float(val), 2) if val is not None else 0.0
    else:
        middle_two = salary_query.offset((count // 2) - 1).limit(2).all()
        if len(middle_two) == 2:
            return round((float(middle_two[0][0]) + float(middle_two[1][0])) / 2.0, 2)
        elif len(middle_two) == 1:
            return round(float(middle_two[0][0]), 2)
        return 0.0


def get_summary(db: Session) -> dict:
    total_employees = db.query(func.count(Employee.id)).filter(Employee.status == "Active").scalar() or 0

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

    median_salary = _calculate_median_salary(db)

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
        median_salary = _calculate_median_salary(db, [Employee.country == row.country])
        data.append(
            {
                "country": row.country,
                "employee_count": row.employee_count,
                "min_salary": _to_float(row.min_salary),
                "max_salary": _to_float(row.max_salary),
                "avg_salary": _to_float(row.avg_salary),
                "median_salary": median_salary,
                "total_spend": _to_float(row.total_spend),
            }
        )

    return {"data": data}


def get_by_job_title(db: Session, country: str | None = None, job_title: str | None = None) -> dict:
    if country == "":
        country = None
    if job_title == "":
        job_title = None

    group_by_both = (job_title is not None) and (country is None)

    if group_by_both:
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
    else:
        query = (
            db.query(
                Employee.job_title,
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

    if group_by_both:
        rows = query.group_by(Employee.job_title, Employee.country).all()
        data = [
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
    else:
        rows = query.group_by(Employee.job_title).all()
        data = [
            {
                "job_title": row.job_title,
                "country": country or "All",
                "employee_count": row.employee_count,
                "min_salary": _to_float(row.min_salary),
                "max_salary": _to_float(row.max_salary),
                "avg_salary": _to_float(row.avg_salary),
            }
            for row in rows
        ]

    return {"data": data}



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
    query = db.query(
        func.sum(case((Employee.salary < 25000, 1), else_=0)).label("b0_25"),
        func.sum(case(((Employee.salary >= 25000) & (Employee.salary < 50000), 1), else_=0)).label("b25_50"),
        func.sum(case(((Employee.salary >= 50000) & (Employee.salary < 75000), 1), else_=0)).label("b50_75"),
        func.sum(case(((Employee.salary >= 75000) & (Employee.salary < 100000), 1), else_=0)).label("b75_100"),
        func.sum(case(((Employee.salary >= 100000) & (Employee.salary < 150000), 1), else_=0)).label("b100_150"),
        func.sum(case((Employee.salary >= 150000, 1), else_=0)).label("b150_plus"),
    ).filter(Employee.status == "Active")

    if country:
        query = query.filter(Employee.country == country)
    if job_title:
        query = query.filter(Employee.job_title == job_title)

    row = query.one()

    return {
        "buckets": [
            {"range": "0-25k", "count": row.b0_25 or 0},
            {"range": "25k-50k", "count": row.b25_50 or 0},
            {"range": "50k-75k", "count": row.b50_75 or 0},
            {"range": "75k-100k", "count": row.b75_100 or 0},
            {"range": "100k-150k", "count": row.b100_150 or 0},
            {"range": "150k+", "count": row.b150_plus or 0},
        ]
    }


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
        return sorted([item[0] for item in db.query(column).filter(Employee.status == "Active").distinct().all() if item[0] is not None])

    db_employment_types = set(distinct_sorted(Employee.employment_type))
    db_statuses = set(distinct_sorted(Employee.status))

    return {
        "countries": distinct_sorted(Employee.country),
        "departments": distinct_sorted(Employee.department),
        "job_titles": distinct_sorted(Employee.job_title),
        "employment_types": sorted(db_employment_types.union(set(EMPLOYMENT_TYPES))),
        "statuses": sorted(db_statuses.union(set(STATUSES))),
    }
