import datetime

from backend.db import db
from sqlalchemy import Enum, Column, Integer, String, Boolean, DateTime,PickleType
from sqlalchemy.orm import relationship
from backend.models.event_job import EventJob
from backend.models.event_status import EventStatus


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    recruiter = db.Column(db.String(80), nullable=False)
    status = db.Column(db.String(20), default="planned", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC))
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC), onupdate=datetime.datetime.now(datetime.UTC))

    @staticmethod
    def create_event(name: str, description: str, location: str, start_time: datetime, end_time: datetime, recruiter: str) -> "Event":
        """
        Creates and returns a new event.
        """
        event = Event(
            name=name,
            description=description,
            location=location,
            start_time=start_time,
            end_time=end_time,
            recruiter=recruiter,
        )
        db.session.add(event)
        db.session.commit()
        return event  # Return the created event

    def delete(self) -> None:
        db.session.delete(self)
        db.session.commit()

    def save_to_db(self) -> None:
        db.session.add(self)
        db.session.commit()
