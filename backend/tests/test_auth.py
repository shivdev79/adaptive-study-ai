from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_user_registration_and_login():
    email = "newstudent@studymind.ai"
    reg_payload = {
        "email": email,
        "password": "testpassword123",
        "full_name": "Test Student",
        "role": "student"
    }
    # Register
    reg_res = client.post("/api/auth/register", json=reg_payload)
    if reg_res.status_code == 400:
        # User already exists from previous test run
        pass
    else:
        assert reg_res.status_code == 200
        assert "access_token" in reg_res.json()

    # Login
    login_res = client.post("/api/auth/login", json={"email": email, "password": "testpassword123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

    # Get Me
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email
