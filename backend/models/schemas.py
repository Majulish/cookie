from pydantic import BaseModel, EmailStr, Field, constr
from backend.models.roles import Role


class SignupRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=8)
    email: EmailStr
    role: Role = Field(...)


class LoginRequest(BaseModel):
    username: constr(min_length=1)
    password: constr(min_length=8)
