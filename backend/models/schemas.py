from typing import List, Optional
from pydantic import BaseModel, EmailStr, constr, conint, field_validator

from backend.models import Role


class SignupRequest(BaseModel):
    username: constr(min_length=1, max_length=80)
    password: constr(min_length=8)
    confirmPassword: constr(min_length=8)
    email: EmailStr
    role: Role
    first_name: constr(min_length=1, max_length=50)
    family_name: constr(min_length=1, max_length=50)
    birthdate: Optional[str]  # Use consistent date format if required
    phone_number: Optional[constr(max_length=20)]
    personal_id: Optional[constr(min_length=9, max_length=9)]
    company_id: Optional[int]
    city: Optional[constr(max_length=50)]
    bank_number: Optional[constr(max_length=20)]
    bank_branch_number: Optional[constr(max_length=10)]
    credit_card_account_number: Optional[constr(max_length=20)]
    abilities: Optional[List[str]] = []
    assigned_jobs: Optional[List[int]] = []
    rating: Optional[conint()] = 0

    @field_validator('confirmPassword')
    @classmethod
    def passwords_match(cls, confirmPassword, values):
        if confirmPassword != values.data['password']:
            raise ValueError('Passwords do not match')
        return confirmPassword

    class Config:
        str_strip_whitespace = True


class LoginRequest(BaseModel):
    username: constr(min_length=1)
    password: constr(min_length=8)
