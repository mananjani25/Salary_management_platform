def _create_employee(client, index: int, **overrides):
    payload = {
        "full_name": f"Employee {index}",
        "email": f"employee{index}@example.com",
        "job_title": "Software Engineer",
        "department": "Engineering",
        "country": "United States",
        "salary": 50000 + index,
        "currency": "USD",
        "employment_type": "Full-time",
        "status": "Active",
        "hire_date": "2024-01-01",
    }
    payload.update(overrides)
    return client.post("/api/v1/employees", json=payload)


def test_list_returns_pagination_object(client):
    for i in range(3):
        _create_employee(client, i)

    response = client.get("/api/v1/employees")
    body = response.json()

    assert "data" in body
    assert "pagination" in body


def test_pagination_has_correct_fields(client):
    for i in range(3):
        _create_employee(client, i)

    response = client.get("/api/v1/employees")
    pagination = response.json().get("pagination", {})

    assert "page" in pagination
    assert "page_size" in pagination
    assert "total" in pagination
    assert "total_pages" in pagination


def test_default_page_size_is_20(client):
    for i in range(25):
        _create_employee(client, i)

    response = client.get("/api/v1/employees")
    assert len(response.json()["data"]) == 20


def test_page_2_returns_correct_offset(client):
    for i in range(25):
        _create_employee(client, i)

    response = client.get("/api/v1/employees?page=2&page_size=20")
    assert len(response.json()["data"]) == 5


def test_search_filters_by_name(client):
    _create_employee(client, 1, full_name="Uniquename Person", email="unique@example.com")
    _create_employee(client, 2, full_name="Another Person", email="another@example.com")

    response = client.get("/api/v1/employees?q=Uniquename")
    data = response.json()["data"]

    assert len(data) == 1
    assert data[0]["full_name"] == "Uniquename Person"


def test_filter_by_country(client):
    _create_employee(client, 1, country="India", email="india1@example.com")
    _create_employee(client, 2, country="India", email="india2@example.com")
    _create_employee(client, 3, country="United States", email="us1@example.com")

    response = client.get("/api/v1/employees?country=India")
    data = response.json()["data"]

    assert len(data) > 0
    assert all(item["country"] == "India" for item in data)


def test_filter_by_department(client):
    _create_employee(client, 1, department="Engineering", email="eng1@example.com")
    _create_employee(client, 2, department="HR", email="hr1@example.com")

    response = client.get("/api/v1/employees?department=Engineering")
    data = response.json()["data"]

    assert len(data) > 0
    assert all(item["department"] == "Engineering" for item in data)


def test_filter_by_status_active(client):
    _create_employee(client, 1, status="Inactive", email="inactive@example.com")
    _create_employee(client, 2, status="Active", email="active1@example.com")
    _create_employee(client, 3, status="Active", email="active2@example.com")

    response = client.get("/api/v1/employees?status=Active")
    data = response.json()["data"]

    assert len(data) == 2


def test_sort_salary_ascending(client):
    _create_employee(client, 1, salary=90000, email="s90000@example.com")
    _create_employee(client, 2, salary=60000, email="s60000@example.com")
    _create_employee(client, 3, salary=75000, email="s75000@example.com")

    response = client.get("/api/v1/employees?sort_by=salary&sort_order=asc")
    data = response.json()["data"]

    assert data[0]["salary"] == 60000


def test_sort_salary_descending(client):
    _create_employee(client, 1, salary=90000, email="d90000@example.com")
    _create_employee(client, 2, salary=60000, email="d60000@example.com")
    _create_employee(client, 3, salary=75000, email="d75000@example.com")

    response = client.get("/api/v1/employees?sort_by=salary&sort_order=desc")
    data = response.json()["data"]

    assert data[0]["salary"] == 90000


def test_page_size_over_100_returns_422(client):
    response = client.get("/api/v1/employees?page_size=200")
    assert response.status_code == 422


def test_filter_by_employment_type(client):
    _create_employee(client, 1, employment_type="Full-time", email="et1@example.com")
    _create_employee(client, 2, employment_type="Contract", email="et2@example.com")

    response = client.get("/api/v1/employees?employment_type=Contract")
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["employment_type"] == "Contract"


def test_search_by_employee_id(client):
    # Wait, the ID format of created employee depends on what index is given.
    # The ID generator function in backend queries db max ID.
    # Let's verify we get a returned employee_id and search for it.
    res = _create_employee(client, 1, full_name="Search ID Target", email="searchid@example.com")
    emp_id = res.json()["employee_id"]

    response = client.get(f"/api/v1/employees?q={emp_id}")
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["full_name"] == "Search ID Target"
