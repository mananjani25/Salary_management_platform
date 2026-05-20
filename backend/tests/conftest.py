from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app


@pytest.fixture(scope="session")
def engine_fixture():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    return engine


@pytest.fixture(scope="function")
def test_db(engine_fixture):
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine_fixture)
    db = testing_session_local()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture(scope="function")
def client(test_db):
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_payload():
    return {
        "full_name": "Alice Johnson",
        "email": "alice.johnson@example.com",
        "job_title": "Software Engineer",
        "department": "Engineering",
        "country": "United States",
        "salary": 90000,
        "currency": "USD",
        "employment_type": "Full-time",
        "status": "Active",
        "hire_date": date.today().isoformat(),
    }
