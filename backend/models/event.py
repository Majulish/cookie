from datetime import datetime

from backend.db import db
from sqlalchemy import Enum, Table, Column, Integer, ForeignKey, String, Boolean, DateTime, text
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

event_job = Table(
    'event_job', db.Model.metadata,
    Column('event_id', Integer, ForeignKey('events.id')),
    Column('job_id', Integer, ForeignKey('jobs.id')),
    Column('openings', Integer, nullable=False)
)


class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)

    events = relationship("Event", secondary=event_job, back_populates="jobs")

    def create_job(self) -> None:
        db.session.add(self)
        db.session.commit()


class EventStatus(PyEnum):
    PLANNED = 'planned'
    STARTED = 'started'
    FINISHED = 'finished'


event_workers = Table(
    'worker', db.Model.metadata,
    Column('event_id', Integer, ForeignKey('events.id')),
    Column('worker_id', String, ForeignKey('users.personal_id'))
)


def add_job_to_event(event_id: int, job_id: int, openings: int) -> None:
    db.session.execute(event_job.insert().values(event_id=event_id, job_id=job_id, openings=openings))
    db.session.commit()


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

    jobs = relationship("Job", secondary=event_job, back_populates="events")

    def __init__(self, id, name, start_time, end_time, description, location, status, advertised):
        self.id = id
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

    def add_worker(self, worker_id: int) -> None:
        try:
            db.session.execute(event_workers.insert().values(event_id=self.id, worker_id=worker_id))
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_worker(event_id: int) -> None:
        db.session.execute(
            text('DELETE FROM worker WHERE event_id = :event_id'),
            {'event_id': event_id}
        )

        db.session.commit()
