from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    login_res = client.post("/api/auth/login", json={"email": "student@studymind.ai", "password": "password123"})
    if login_res.status_code == 200:
        return login_res.json()["access_token"]
    # Register if not present
    reg_res = client.post("/api/auth/register", json={
        "email": "student@studymind.ai",
        "password": "password123",
        "full_name": "Alex Mercer"
    })
    return reg_res.json()["access_token"]

def test_course_creation_and_listing():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "name": "Data Structures & Algorithms",
        "subject": "Computer Science",
        "description": "Trees, Graphs, Dynamic Programming",
        "target_score": 95.0,
        "difficulty": "Medium"
    }
    create_res = client.post("/api/courses", json=payload, headers=headers)
    assert create_res.status_code == 200
    course_id = create_res.json()["id"]

    list_res = client.get("/api/courses", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
