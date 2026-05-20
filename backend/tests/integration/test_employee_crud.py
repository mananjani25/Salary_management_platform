import re


def test_create_employee_returns_201(client, sample_payload):
    response = client.post("/api/v1/employees", json=sample_payload)
    assert response.status_code == 201


def test_create_employee_response_has_id_and_employee_id(client, sample_payload):
    response = client.post("/api/v1/employees", json=sample_payload)
    body = response.json()

    assert isinstance(body.get("id"), int)
    assert isinstance(body.get("employee_id"), str)


def test_employee_id_follows_emp_format(client, sample_payload):
    response = client.post("/api/v1/employees", json=sample_payload)
    employee_id = response.json().get("employee_id", "")
    assert re.match(r"^EMP-\d{5}$", employee_id)


def test_create_employee_missing_full_name_returns_422(client, sample_payload):
    payload = dict(sample_payload)
    payload.pop("full_name")

    response = client.post("/api/v1/employees", json=payload)
    assert response.status_code == 422


def test_create_employee_invalid_email_returns_422(client, sample_payload):
    payload = dict(sample_payload)
    payload["email"] = "bad"

    response = client.post("/api/v1/employees", json=payload)
    assert response.status_code == 422


def test_create_employee_salary_zero_returns_422(client, sample_payload):
    payload = dict(sample_payload)
    payload["salary"] = 0

    response = client.post("/api/v1/employees", json=payload)
    assert response.status_code == 422


def test_create_duplicate_email_returns_400(client, sample_payload):
    first = client.post("/api/v1/employees", json=sample_payload)
    second = client.post("/api/v1/employees", json=sample_payload)

    assert first.status_code == 201
    assert second.status_code == 400


def test_get_employee_by_id_returns_200(client, sample_payload):
    created = client.post("/api/v1/employees", json=sample_payload)
    employee_id = created.json()["id"]

    response = client.get(f"/api/v1/employees/{employee_id}")
    assert response.status_code == 200
    assert response.json()["full_name"] == sample_payload["full_name"]


def test_get_nonexistent_employee_returns_404(client):
    response = client.get("/api/v1/employees/99999")
    assert response.status_code == 400


def test_update_employee_returns_200(client, sample_payload):
    created = client.post("/api/v1/employees", json=sample_payload)
    employee_id = created.json()["id"]

    payload = dict(sample_payload)
    payload["email"] = "alice.updated@example.com"
    payload["salary"] = 99000

    response = client.put(f"/api/v1/employees/{employee_id}", json=payload)
    assert response.status_code == 200
    assert response.json()["salary"] == 99000


def test_update_nonexistent_employee_returns_404(client, sample_payload):
    response = client.put("/api/v1/employees/99999", json=sample_payload)
    assert response.status_code == 400


def test_patch_employee_updates_single_field(client, sample_payload):
    created = client.post("/api/v1/employees", json=sample_payload)
    employee_id = created.json()["id"]

    response = client.patch(f"/api/v1/employees/{employee_id}", json={"salary": 99999.00})
    assert response.status_code == 200

    body = response.json()
    assert body["salary"] == 99999.00
    assert body["full_name"] == sample_payload["full_name"]
    assert body["email"] == sample_payload["email"]


def test_delete_employee_returns_200(client, sample_payload):
    created = client.post("/api/v1/employees", json=sample_payload)
    employee_id = created.json()["id"]

    response = client.delete(f"/api/v1/employees/{employee_id}")
    assert response.status_code == 200


def test_delete_sets_status_inactive(client, sample_payload):
    created = client.post("/api/v1/employees", json=sample_payload)
    employee_id = created.json()["id"]

    delete_response = client.delete(f"/api/v1/employees/{employee_id}")
    assert delete_response.status_code == 200

    get_response = client.get(f"/api/v1/employees/{employee_id}")
    assert get_response.status_code == 200
    assert get_response.json()["status"] == "Inactive"


def test_delete_nonexistent_employee_returns_404(client):
    response = client.delete("/api/v1/employees/99999")
    assert response.status_code == 400

