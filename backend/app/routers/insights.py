from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.insights_service import (
    get_by_country,
    get_by_department,
    get_by_job_title,
    get_salary_distribution,
    get_summary,
    get_top_paid,
)

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/summary")
def summary_endpoint(db: Session = Depends(get_db)):
    return get_summary(db)


@router.get("/by-country")
def by_country_endpoint(country: str | None = None, db: Session = Depends(get_db)):
    return get_by_country(db, country)


@router.get("/by-job-title")
def by_job_title_endpoint(
    country: str | None = None,
    job_title: str | None = None,
    db: Session = Depends(get_db),
):
    return get_by_job_title(db, country, job_title)


@router.get("/by-department")
def by_department_endpoint(db: Session = Depends(get_db)):
    return get_by_department(db)


@router.get("/salary-distribution")
def salary_distribution_endpoint(
    country: str | None = None,
    job_title: str | None = None,
    db: Session = Depends(get_db),
):
    return get_salary_distribution(db, country, job_title)


@router.get("/top-paid")
def top_paid_endpoint(
    limit: int = Query(default=10, ge=1),
    country: str | None = None,
    department: str | None = None,
    db: Session = Depends(get_db),
):
    return get_top_paid(db, limit, country, department)
