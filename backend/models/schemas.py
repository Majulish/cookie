from datetime import datetime
from typing import List, Optional, Dict

from pydantic import BaseModel, EmailStr, constr, conint, field_validator

from backend.models.event_status import EventStatus
from backend.models.roles import Role


class SignupRequest(BaseModel):
    username: constr(min_length=1, max_length=80)
    password: constr(min_length=8)
    email: EmailStr
    role: Role
    first_name: constr(min_length=1, max_length=50)
    family_name: constr(min_length=1, max_length=50)
    birthdate: Optional[str]
    phone_number: Optional[constr(max_length=20)]
    personal_id: Optional[constr(min_length=9, max_length=9)]
    company_id: Optional[str]
    company_name: Optional[str]
    city: constr(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    username: constr(min_length=1)
    password: constr(min_length=8)


class UpdateEvent(BaseModel):
    name: Optional[constr(min_length=1, max_length=100)]
    description: Optional[constr(min_length=1, max_length=1000)]
    location: Optional[constr(min_length=1, max_length=200)]
    start_datetime: Optional[datetime]
    end_datetime: Optional[datetime]
    jobs: Optional[Dict[str, int]] = None


class FeedEventSchema(BaseModel):
    id: int
    name: constr(max_length=80)
    description: Optional[constr(max_length=200)]
    location: Optional[constr(max_length=100)]
    start_datetime: str  # ISO format
    end_datetime: str  # ISO format
    recruiter: constr(max_length=80)
    status: constr(max_length=20)


class FeedResponseSchema(BaseModel):
    events: List[FeedEventSchema]


class MyEventJobSchema(BaseModel):
    job_id: int
    job_title: constr(max_length=80)
    openings: int

