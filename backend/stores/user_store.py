from werkzeug.security import generate_password_hash, check_password_hash
from typing import Optional, Dict, Any

from backend.models.user import User


class UserStore:
    @staticmethod
    def create_user(data: Dict[str, Any]) -> User:
        hashed_password = generate_password_hash(data['password'])
        user = User(
            username=data['username'],
            email=data['email'],
            password=hashed_password,
            role=data.get('role', 'worker'),
            birthdate=data.get('birthdate'),
            bank_number=data.get('bank_number'),
            bank_branch_number=data.get('bank_branch_number'),
            credit_card_account_number=data.get('credit_card_account_number'),
            abilities=data.get('abilities', []),
            assigned_jobs=data.get('assigned_jobs', []),
            rating=data.get('rating', 0.0),
            phone_number=data.get('phone_number'),
            first_name=data.get('first_name'),
            family_name=data.get('family_name'),
            personal_id=data.get('personal_id'),
            company_id=data.get('company_id'),
            city=data.get('city'),
        )
        user.save_to_db()
        return user

    @staticmethod
    def update_user(user_id: int, data: Dict[str, Any]) -> Optional[User]:
        user = User.find_by_id(user_id)
        if user:
            user.update_user(data)
            return user
        return None

    @staticmethod
    def delete_user(user: User) -> None:
        user.delete()

    @staticmethod
    def find_user_by_username(username: str) -> Optional[User]:
        return User.find_by_username(username)

    @staticmethod
    def find_user_by_email(email: str) -> Optional[User]:
        return User.find_by_email(email)

    @staticmethod
    def find_user_by_id(user_id: int) -> Optional[User]:
        return User.find_by_id(user_id)

    @staticmethod
    def delete_user_by_username(username: str) -> bool:
        user = User.find_by_username(username)
        if user:
            user.delete()
            return True
        return False

    @staticmethod
    def check_password(stored_password: str, provided_password: str) -> bool:
        return check_password_hash(stored_password, provided_password)
