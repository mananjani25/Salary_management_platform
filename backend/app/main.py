import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.database import Base, engine
from app.models.employee import Employee  # noqa: F401
from app.routers.employees import router as employees_router
from app.routers.insights import router as insights_router
from app.routers.meta import router as meta_router
from app.utils.errors import make_error

load_dotenv()

origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app = FastAPI(title="Salary Management Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(employees_router, prefix="/api/v1")
app.include_router(insights_router, prefix="/api/v1")
app.include_router(meta_router, prefix="/api/v1")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = [
        {
            "field": ".".join(str(part) for part in err.get("loc", [])),
            "message": err.get("msg", "Invalid value"),
            "type": err.get("type", "validation_error"),
        }
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content=make_error("VALIDATION_ERROR", "Request validation failed", details),
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=make_error("INTERNAL_ERROR", "An unexpected error occurred"),
    )


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/v1/health")
def api_v1_health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/v1/health/db")
def db_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"database": "connected"}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=make_error("DB_CONNECTION_FAILED", f"Database connection failed: {exc}"),
        ) from exc
