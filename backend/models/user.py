from datetime import datetime
from typing import Optional

from backend.db import db
from sqlalchemy import Enum
from backend.models.roles import Role
from backend.app.auth import check_password


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    role = db.Column(Enum(Role), nullable=False)
    birthdate = db.Column(db.Date, nullable=True)
    bank_number = db.Column(db.String(20), nullable=True)
    bank_branch_number = db.Column(db.String(10), nullable=True)
    credit_card_account_number = db.Column(db.String(20), nullable=True)
    abilities = db.Column(db.ARRAY(db.String), nullable=True)  # List of strings
    assigned_jobs = db.Column(db.ARRAY(db.Integer), nullable=True)  # List of job IDs (integers)
    rating = db.Column(db.Float, nullable=True, default=0.0)
    phone_number = db.Column(db.String(20), nullable=True)
    first_name = db.Column(db.String(50), nullable=False)
    family_name = db.Column(db.String(50), nullable=False)
    personal_id = db.Column(db.String(10), unique=True, nullable=False)
    company_id = db.Column(db.Integer, nullable=True)
    city = db.Column(db.String(50), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def check_password(self, password: str) -> bool:
        return check_password(self.password_hash, password)

    def update_user(self, data: dict) -> None:
        for key, value in data.items():
            if hasattr(self, key) and key != 'id':  # Prevent updating the ID directly
                setattr(self, key, value)
        self.updated_at = datetime.now()
        db.session.commit()

    def delete(self) -> None:
        db.session.delete(self)
        db.session.commit()

    def save_to_db(self) -> None:
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_username(cls, username: str) -> Optional['User']:
        return cls.query.filter_by(username=username).first()

    @classmethod
    def find_by_email(cls, email: str) -> Optional['User']:
        return cls.query.filter_by(email=email).first()

    @classmethod
    def find_by_id(cls, user_id: int) -> Optional['User']:
        return cls.query.filter_by(id=user_id).first()

    @classmethod
    def delete_by_id(cls, user_id: int) -> None:
        user = cls.find_by_id(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
