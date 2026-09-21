from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    full_name: str
    role: str

class ProfileResponse(BaseModel):
    avatar_url: Optional[str] = None
    institution: Optional[str] = None
    academic_level: str
    xp: int
    streak_days: int
    target_daily_hours: float

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    profile: Optional[ProfileResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True
