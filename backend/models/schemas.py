from pydantic import BaseModel, EmailStr, constr


class SignupRequest(BaseModel):
    username: constr(min_length=1)
    password: constr(min_length=8)
    email: EmailStr


class LoginRequest(BaseModel):
    username: constr(min_length=1)
    password: constr(min_length=8)
