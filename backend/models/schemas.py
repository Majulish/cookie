from datetime import datetime
from typing import List, Optional

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
    birthdate: Optional[str]  # Use consistent date format if required
    phone_number: Optional[constr(max_length=20)]
    personal_id: Optional[constr(min_length=9, max_length=9)]
    company_id: Optional[str]
    company_name: Optional[str]



class LoginRequest(BaseModel):
    username: constr(min_length=1)
    password: constr(min_length=8)


class UpdateEvent(BaseModel):
    name: constr(min_length=1, max_length=100)
    id: constr(min_length=1, max_length=256)
    description: Optional[constr(min_length=1, max_length=500)]
    location: constr(min_length=1, max_length=200)
    start_time: datetime
    end_time: datetime
    status: Optional[EventStatus] = EventStatus.PLANNED
    advertised: Optional[bool] = False
