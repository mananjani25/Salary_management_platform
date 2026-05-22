import math

from fastapi import HTTPException
from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeePatch, EmployeeUpdate
from app.utils.errors import make_error


def generate_employee_id(db: Session) -> str:
    max_id = db.query(func.max(Employee.id)).scalar()
    next_id = (max_id or 0) + 1
    return f"EMP-{next_id:05d}"


def create_employee(db: Session, data: EmployeeCreate) -> Employee:
    existing = db.query(Employee).filter(Employee.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=make_error("DUPLICATE_EMAIL", "Employee with this email already exists"),
        )

    employee = Employee(
        employee_id=generate_employee_id(db),
        **data.model_dump(),
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def get_employee_or_404(db: Session, employee_id: int) -> Employee:
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=404,
            detail=make_error("NOT_FOUND", f"Employee {employee_id} not found"),
        )
    return employee


def update_employee(db: Session, employee_id: int, data: EmployeeUpdate) -> Employee:
    employee = get_employee_or_404(db, employee_id)

    duplicate = (
        db.query(Employee)
        .filter(Employee.email == data.email, Employee.id != employee_id)
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=400,
            detail=make_error("DUPLICATE_EMAIL", "Employee with this email already exists"),
        )

    for field, value in data.model_dump().items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)
    return employee


def patch_employee(db: Session, employee_id: int, data: EmployeePatch) -> Employee:
    employee = get_employee_or_404(db, employee_id)
    update_data = data.model_dump(exclude_unset=True)

    if "email" in update_data:
        duplicate = (
            db.query(Employee)
            .filter(Employee.email == update_data["email"], Employee.id != employee_id)
            .first()
        )
        if duplicate:
            raise HTTPException(
                status_code=400,
                detail=make_error("DUPLICATE_EMAIL", "Employee with this email already exists"),
            )

    for field, value in update_data.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)
    return employee


def delete_employee(db: Session, employee_id: int) -> dict:
    employee = get_employee_or_404(db, employee_id)
    employee.status = "Inactive"
    db.commit()
    return {"message": "Employee deactivated"}


def list_employees(
    db: Session,
    page: int,
    page_size: int,
    search: str,
    country: str,
    department: str,
    job_title: str,
    status: str,
    sort_by: str,
    sort_order: str,
    employment_type: str = "",
) -> dict:
    allowed_sort_fields = ["full_name", "salary", "hire_date", "country", "department", "job_title"]
    if sort_by not in allowed_sort_fields:
        raise HTTPException(
            status_code=422,
            detail=make_error("INVALID_SORT_BY", "Invalid sort_by value", [f"Allowed: {allowed_sort_fields}"]),
        )
    if page_size > 100:
        raise HTTPException(
            status_code=422,
            detail=make_error("INVALID_PAGE_SIZE", "page_size must be less than or equal to 100"),
        )

    query = db.query(Employee).filter(Employee.status == "Active")

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                Employee.full_name.ilike(like),
                Employee.email.ilike(like),
                Employee.job_title.ilike(like),
                Employee.employee_id.ilike(like),
            )
        )
    if country:
        query = query.filter(Employee.country == country)
    if department:
        query = query.filter(Employee.department == department)
    if job_title:
        query = query.filter(Employee.job_title == job_title)
    if status:
        query = query.filter(Employee.status == status)
    if employment_type:
        query = query.filter(Employee.employment_type == employment_type)

    total = query.count()

    sort_column = getattr(Employee, sort_by)
    query = query.order_by(desc(sort_column) if sort_order == "desc" else asc(sort_column))

    records = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "data": [
            {
                "id": item.id,
                "employee_id": item.employee_id,
                "full_name": item.full_name,
                "email": item.email,
                "job_title": item.job_title,
                "department": item.department,
                "country": item.country,
                "salary": float(item.salary),
                "currency": item.currency,
                "employment_type": item.employment_type,
                "status": item.status,
                "hire_date": item.hire_date.isoformat(),
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None,
            }
            for item in records
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": math.ceil(total / page_size) if total else 0,
        },
    }
