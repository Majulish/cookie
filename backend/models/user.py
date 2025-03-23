from sqlalchemy.orm import relationship
import datetime
from typing import Optional, Dict

from sqlalchemy import Enum

from backend.db import db
from backend.models.reviews import Review
from backend.models.roles import Role
from backend.utils.auth import check_password


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    role = db.Column(Enum(Role), nullable=False)
    birthdate = db.Column(db.String(20), nullable=True)
    bank_number = db.Column(db.String(20), nullable=True)
    bank_branch_number = db.Column(db.String(10), nullable=True)
    credit_card_account_number = db.Column(db.String(20), nullable=True)
    abilities = db.Column(db.ARRAY(db.String), nullable=True)
    assigned_jobs = db.Column(db.ARRAY(db.Integer), nullable=True)
    rating = db.Column(db.Float, nullable=True, default=0.0)
    rating_count = db.Column(db.Integer, nullable=True, default=0)
    phone_number = db.Column(db.String(20), nullable=True)
    first_name = db.Column(db.String(50), nullable=False)
    family_name = db.Column(db.String(50), nullable=False)
    personal_id = db.Column(db.String(256), unique=True, nullable=False)
    company_name = db.Column(db.String(50), nullable=True)
    company_id = db.Column(db.String(50), default="0")
    city = db.Column(db.String(100), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC))
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC),
                           onupdate=datetime.datetime.now(datetime.UTC))

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def check_password(self, password: str) -> bool:
        return check_password(self.password_hash, password)

    def update_user(self, data: Dict) -> None:
        for key, value in data.items():
            if hasattr(self, key) and key != 'id':
                setattr(self, key, value)
        self.updated_at = datetime.datetime.now(datetime.UTC)
        db.session.commit()

    def delete(self) -> None:
        db.session.delete(self)
        db.session.commit()

    def save_to_db(self) -> None:
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by(cls, filters: dict) -> Optional['User']:
        try:
            return cls.query.filter_by(**filters).first()
        except Exception as e:
            db.session.rollback()
            print(e)
            raise e

    @classmethod
    def delete_by(cls, field: str, value: str) -> bool:
        try:
            user = cls.find_by({field: value})
            if user:
                user.delete()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            raise e

    def update_rating(self, new_rating: float) -> None:
        """
        Updates the worker's rating by averaging previous and new ratings.
        """
        self.rating = ((self.rating * self.rating_count) + new_rating) / (self.rating_count + 1 )
        self.rating_count += 1

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

