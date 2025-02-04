from sqlalchemy.orm import relationship
from backend.db import db
from backend.models.event_job import EventJob
from backend.stores import EventStore


class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)

    events = relationship("Event", secondary="event_job", back_populates="jobs")

    def create_job(self) -> None:
        db.session.add(self)
        db.session.commit()

    @staticmethod
    def add_job_to_event(event_id: int, job_id: int, openings: int) -> str:
        event = EventStore.get_event_by_id(event_id)
        if not event:
            return "Event not found"

        event.add_job_to_event(job_id, openings)
        return "Job added successfully"


    def save_to_db(self) -> None:
        db.session.add(self)
        db.session.commit()