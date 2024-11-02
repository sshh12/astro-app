from pydantic import BaseModel
from typing import Optional


class UserBase(BaseModel):
    email: Optional[str] = None
    username: str
    is_active: Optional[bool] = True
    is_superuser: bool = False


class UserCreate(UserBase):
    email: str
    password: str


class UserUpdate(UserBase):
    password: Optional[str] = None


class User(UserBase):
    id: int

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[int] = None
