from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.employee import EmployeeCreate, EmployeePatch, EmployeeResponse, EmployeeUpdate
from app.services.employee_service import (
    create_employee,
    delete_employee,
    get_employee_or_404,
    list_employees,
    patch_employee,
    update_employee,
)

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/")
def list_employees_endpoint(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1),
    q: str = Query(default=""),
    country: str = Query(default=""),
    department: str = Query(default=""),
    job_title: str = Query(default=""),
    status: str = Query(default=""),
    employment_type: str = Query(default=""),
    sort_by: str = Query(default="full_name"),
    sort_order: str = Query(default="asc"),
    db: Session = Depends(get_db),
):
    return list_employees(
        db=db,
        page=page,
        page_size=page_size,
        search=q,
        country=country,
        department=department,
        job_title=job_title,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order,
        employment_type=employment_type,
    )


@router.post("/", response_model=EmployeeResponse, status_code=201)
def create_employee_endpoint(payload: EmployeeCreate, db: Session = Depends(get_db)):
    return create_employee(db, payload)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee_endpoint(employee_id: int, db: Session = Depends(get_db)):
    return get_employee_or_404(db, employee_id)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee_endpoint(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    return update_employee(db, employee_id, payload)


@router.patch("/{employee_id}", response_model=EmployeeResponse)
def patch_employee_endpoint(employee_id: int, payload: EmployeePatch, db: Session = Depends(get_db)):
    return patch_employee(db, employee_id, payload)


@router.delete("/{employee_id}")
def delete_employee_endpoint(employee_id: int, db: Session = Depends(get_db)):
    return delete_employee(db, employee_id)
