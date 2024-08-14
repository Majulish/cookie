from backend.models.roles import Role
from flask import current_app as app
from typing import Optional, Dict


class User:
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
