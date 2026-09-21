from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.models.user import User
from app.core.security import get_current_user
from app.ai.llm_provider import llm

router = APIRouter(prefix="/solver", tags=["Specialized Solvers"])

class NumericalSolveRequest(BaseModel):
    problem_statement: str
    teach_me_mode: Optional[bool] = True

class CodingSolveRequest(BaseModel):
    code: str
    language: str  # cpp, python, java, javascript
    action: Optional[str] = "explain"  # explain, debug, optimize, complexity
    problem: Optional[str] = None  # Alternative: problem description instead of code snippet

@router.post("/numerical")
def solve_numerical_problem(
    req: NumericalSolveRequest,
    current_user: User = Depends(get_current_user)
):
    system_prompt = """You are StudyMind AI's Numerical Problem Solver.
Provide a step-by-step breakdown:
1. Given values
2. Relevant formula
3. Step-by-step substitution and calculations
4. Final answer with units
5. "Teach Me" concept explanation
"""
    solution = llm.generate_completion(system_prompt, req.problem_statement)
    return {
        "problem": req.problem_statement,
        "solution": solution
    }

@router.post("/coding")
def solve_coding_problem(
    req: CodingSolveRequest,
    current_user: User = Depends(get_current_user)
):
    system_prompt = f"""You are StudyMind AI's Coding Tutor.
Action requested: {req.action.upper()}
Language: {req.language}
Provide clean code formatting, time/space complexity, error identification, and optimization hints.
"""
    user_content = f"Code snippet (Language: {req.language}):\n```{req.language}\n{req.code}\n```"
    if req.problem:
        user_content = f"Problem: {req.problem}\n\n{user_content}"
    result = llm.generate_completion(system_prompt, user_content)
    return {
        "language": req.language,
        "action": req.action,
        "analysis": result
    }

@router.post("/image")
def solve_image_question(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Simulated Vision/OCR Pipeline for image uploads
    extracted_text = "Calculated SVM Margin question: Given w = [3, 4]^T and b = 2, calculate the perpendicular distance from origin to hyperplane."
    solution = """### Image Question Solution (OCR Extracted)

**Extracted Problem**: Calculate distance from origin to hyperplane $3x_1 + 4x_2 + 2 = 0$.

1. **Formula**: Distance $d = \\frac{|b|}{||w||}$
2. **Norm calculation**: $||w|| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$
3. **Distance**: $d = \\frac{|2|}{5} = 0.4$ units.
"""
    return {
        "extracted_text": extracted_text,
        "solution": solution
    }
