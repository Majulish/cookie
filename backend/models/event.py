from datetime import datetime

from backend.db import db
from sqlalchemy import Enum, Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from backend.models.event_job import EventJob
from backend.models.event_status import EventStatus


class Event(db.Model):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    description = Column(String(200), nullable=True)
    location = Column(String(100), nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.now())
    status = Column(Enum(EventStatus), default=EventStatus.PLANNED, nullable=False)
    advertised = Column(Boolean, default=False, nullable=False)

    jobs = relationship("Job", secondary="event_job", back_populates="events")

    def __init__(self, event_id, name, start_time, end_time, description, location, status, advertised):
        self.id = event_id
        self.name = name
        self.start_time = start_time
        self.end_time = end_time
        self.description = description
        self.location = location
        self.status = status
        self.advertised = advertised

    def create_event(self) -> None:
        db.session.add(self)
        db.session.commit()

    def delete(self) -> None:
        db.session.delete(self)
        db.session.commit()

    def save_to_db(self) -> None:
        db.session.add(self)
        db.session.commit()
