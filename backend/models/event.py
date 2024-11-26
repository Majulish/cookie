import datetime
from typing import List, Dict

from backend.db import db
from backend.models.event_users import EventUsers
from backend.models.event_job import EventJob


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    start_datetime = db.Column(db.DateTime, nullable=False)
    end_datetime = db.Column(db.DateTime, nullable=False)
    recruiter = db.Column(db.String(80), nullable=False)
    status = db.Column(db.String(20), default="planned", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC))
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC),
                           onupdate=datetime.datetime.now(datetime.UTC))

    @staticmethod
    def create_event(name: str, description: str, location: str, start_datetime: datetime, end_datetime: datetime,
                     recruiter: str) -> "Event":
        """
        Creates and returns a new event.
        """
        event = Event(
            name=name,
            description=description,
            location=location,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
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

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "location": self.location,
            "start_datetime": self.start_datetime.isoformat(),
            "end_datetime": self.end_datetime.isoformat(),
            "recruiter": self.recruiter,
            "status": self.status,
        }

    @staticmethod
    def get_future_events_excluding_signed(worker_id: str, filters: Dict) -> List["Event"]:
        """
        Fetches future events that a worker can apply to, excluding events they're already signed up for.
        """
        try:
            signed_event_ids = db.session.query(EventUsers.event_id).filter_by(worker_id=worker_id).subquery()
            query = Event.query.filter(
                Event.start_datetime > datetime.datetime.now(datetime.UTC),
                ~Event.id.in_(signed_event_ids)
            )

            if "location" in filters:
                query = query.filter(Event.location == filters["location"])
            if "job_title" in filters:
                query = query.join(EventJob).filter(EventJob.job_title == filters["job_title"])

            return query.all()

        except Exception as e:
            raise e

    @staticmethod
    def get_events_by_worker(worker_id: str) -> List['Event']:
        """
        Retrieves all events that a specific worker is signed up for.
        """
        try:
            return (
                db.session.query(Event)
                .join(EventUsers, Event.id == EventUsers.event_id)
                .filter(EventUsers.worker_id == worker_id)
                .all()
            )
        except Exception as e:
            db.session.rollback()
            raise e
