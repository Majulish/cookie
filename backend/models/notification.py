import datetime
from backend.db import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(512), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC))
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC),
                           onupdate=datetime.datetime.now(datetime.UTC))

    def __init__(self, user_id: int, message: str):
        self.user_id = user_id
        self.message = message

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def create_notification(cls, user_id: int, message: str) -> "Notification":
        notification = cls(user_id, message)
        notification.save_to_db()
        return notification

    @classmethod
    def find_by_id(cls, notification_id: int) -> "Notification":
        return cls.query.get(notification_id)

    def mark_as_read(self):
        self.is_read = True
        self.save_to_db()
