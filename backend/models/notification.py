import datetime
from typing import Optional
from backend.db import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(512), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=False)  # New field for worker confirmation
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC))
    updated_at = db.Column(
        db.DateTime,
        default=datetime.datetime.now(datetime.UTC),
        onupdate=datetime.datetime.now(datetime.UTC),
    )

    def __init__(self, user_id: int, message: str, event_id: Optional[int] = None, is_approved: bool = False):
        self.user_id = user_id
        self.message = message
        self.event_id = event_id
        self.is_approved = is_approved

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "is_read": self.is_read,
            "is_approved": self.is_approved,
            "event_id": self.event_id,
            "created_at": self.created_at.isoformat(),
        }

    @classmethod
    def create_notification(cls, user_id: int, message: str, event_id: Optional[int] = None, is_approved: bool = False) -> "Notification":
        notification = cls(user_id, message, event_id, is_approved)
        notification.save_to_db()
        return notification

    @classmethod
    def find_by_id(cls, notification_id: int) -> "Notification":
        return cls.query.get(notification_id)

    def mark_as_read(self):
        self.is_read = True
        self.save_to_db()
