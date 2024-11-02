from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.core.security import create_access_token
from app.crud import user_crud
from app.schemas.user_schemas import User, UserCreate, UserUpdate, Token
from datetime import timedelta
from app.core.config import settings

router = APIRouter()


@router.post("/login/access-token", response_model=Token)
def login_access_token(
    username: str,
    password: str,
    db: Session = Depends(deps.get_db),
):
    user = user_crud.authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            data={"sub": user.id}, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/users", response_model=User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
):
    user = user_crud.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists.",
        )
    user = user_crud.get_user_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this username already exists.",
        )
    return user_crud.create_user(db, user_in)


@router.get("/users/me", response_model=User)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
):
    return current_user


@router.put("/users/me", response_model=User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
):
    return user_crud.update_user(db, current_user.id, user_in)


@router.get("/users/{user_id}", response_model=User)
def read_user_by_id(
    user_id: int,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
):
    user = user_crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Not enough permissions",
        )
    return user
