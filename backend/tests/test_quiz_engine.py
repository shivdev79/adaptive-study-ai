from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    login_res = client.post("/api/auth/login", json={"email": "student@studymind.ai", "password": "password123"})
    return login_res.json()["access_token"]

def test_quiz_generation_and_submission():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Get course ID
    courses_res = client.get("/api/courses", headers=headers)
    course_id = courses_res.json()[0]["id"]

    # Generate Quiz
    gen_res = client.post("/api/quizzes/generate", json={
        "course_id": course_id,
        "quiz_type": "adaptive",
        "total_questions": 2,
        "difficulty": "medium"
    }, headers=headers)
    assert gen_res.status_code == 200
    quiz_data = gen_res.json()
    quiz_id = quiz_data["id"]
    questions = quiz_data["questions"]
    assert len(questions) > 0

    # Submit Quiz
    answers = []
    for q in questions:
        answers.append({
            "question_id": q["id"],
            "student_response": q.get("options", ["Correct option"])[0] if q.get("options") else "Sample answer"
        })

    sub_res = client.post(f"/api/quizzes/{quiz_id}/submit", json={
        "quiz_id": quiz_id,
        "answers": answers,
        "time_taken_seconds": 60
    }, headers=headers)
    assert sub_res.status_code == 200
    assert "score_percentage" in sub_res.json()
