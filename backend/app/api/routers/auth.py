from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database.session import get_db
from app.models.user import User, Profile
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role or "student"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = Profile(user_id=user.id, academic_level="Undergraduate")
    db.add(profile)
    db.commit()

    token = create_access_token(user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        role=user.role
    )

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    token = create_access_token(user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        role=user.role
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
