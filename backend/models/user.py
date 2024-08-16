from flask import current_app as app
from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel as PydanticBaseModel

from backend.models.base_model import BaseModel
from backend.models.roles import Role


class UserModel(PydanticBaseModel):
    id: str
    username: str
    email: str
    password: str
    created_at: datetime
    updated_at: datetime


class User(BaseModel):
    @staticmethod
    def find_by_username(username: str) -> Optional[Dict]:
        return app.db.users.find_one({"username": username})

    @staticmethod
    def create(user_data: Dict) -> None:
        app.db.users.insert_one(user_data)

    @staticmethod
    def delete_by_username(username: str) -> None:
        app.db.users.delete_one({"username": username})

    @staticmethod
    def get_role(username: str) -> Optional[Role]:
        user = app.db.users.find_one({"username": username})
        if user and "role" in user:
            return Role(user["role"])
        return None
