from datetime import datetime
from typing import Optional, List
from backend.db import db
from sqlalchemy import Enum, Table, Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from backend.models.roles import Role
from enum import Enum as PyEnum

class EventStatus(PyEnum):
    PLANNED = 'planned'
    STARTED = 'started'
    FINISHED = 'finished'

# Association table for event-worker relationship
event_worker = Table(
    'event_worker', db.Model.metadata,
    Column('event_id', Integer, db.ForeignKey('events.id')),
    Column('user_id', Integer, db.ForeignKey('users.id'))
)

class Event(db.Model):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    description = Column(String(200), nullable=True)
    location = Column(String(100), nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    status = Column(Enum(EventStatus), default=EventStatus.PLANNED, nullable=False)
    advertised = Column(Boolean, default=False, nullable=False)

    # Relationships
    users = relationship('User', secondary=event_worker, back_populates='events')
    job_ids = db.Column(db.ARRAY(db.Integer), nullable=True)  # Store job IDs directly

    def __init__(self, name: str, start_time: datetime, end_time: datetime, description: Optional[str] = None,
                 location: Optional[str] = None, status: EventStatus = EventStatus.PLANNED, advertised: bool = False):
        self.name = name
        self.description = description
        self.location = location
        self.start_time = start_time
        self.end_time = end_time
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

    def add_worker(self, user_id: int) -> None:
        connection = db.engine.connect()
        connection.execute(event_worker.insert().values(event_id=self.id, user_id=user_id))
        connection.close()
        db.session.commit()

    def add_job(self, job_id: int) -> None:
        if self.job_ids is None:
            self.job_ids = []
        self.job_ids.append(job_id)
        db.session.commit()

    def get_workers(self) -> List['User']:
        return [user for user in self.users if user.role == Role.WORKER]

    def get_job_ids(self) -> List[int]:
        return self.job_ids
