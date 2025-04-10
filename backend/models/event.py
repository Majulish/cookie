import datetime
from typing import List, Dict, Optional, Tuple

from flask import Response, jsonify

from backend.db import db
from backend.models.event_job import EventJob
from backend.models.event_users import EventUsers


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(2000), nullable=True)
    address = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    start_datetime = db.Column(db.DateTime, nullable=False)
    end_datetime = db.Column(db.DateTime, nullable=False)
    recruiter = db.Column(db.String(80), nullable=False)
    status = db.Column(db.String(20), default="planned", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC))
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC),
                           onupdate=datetime.datetime.now(datetime.UTC))
    company_id = db.Column(db.String(50), default="0")

    @staticmethod
    def create_event(name: str,
                     description: str,
                     city: str,
                     address: str,
                     start_datetime: datetime.datetime,
                     end_datetime: datetime.datetime,
                     recruiter: str,
                     company_id: str) -> "Event":
        event = Event(
            name=name,
            description=description,
            city=city,
            address=address,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
            recruiter=recruiter,
            company_id=company_id,
        )
        db.session.add(event)
        db.session.commit()
        return event

    def update_event(self, data: dict) -> None:
        """
        Updates event fields. If 'status' is passed as an EventStatus enum,
        convert it to its string representation.
        """
        for key, value in data.items():
            if hasattr(self, key) and key != 'id' and value:
                setattr(self, key, value)
        db.session.commit()

    @staticmethod
    def delete(event_id: int) -> Tuple[Response, int]:
        event = Event.find_by("id", event_id)
        if not event:
            return jsonify({"error": "Event not found"}), 404
        try:
            EventJob.query.filter_by(event_id=event_id).delete()
            EventUsers.query.filter_by(event_id=event_id).delete()
            db.session.delete(event)
            db.session.commit()
            return jsonify({"message": "Event deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    def save_to_db(self) -> None:
        db.session.add(self)
        db.session.commit()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "address": self.address,
            "city": self.city,
            "start_datetime": self.start_datetime.isoformat(),
            "end_datetime": self.end_datetime.isoformat(),
            "recruiter": self.recruiter,
            "status": self.status,
            "jobs": [
                {
                    "job_title": job.job_title,
                    "slots": job.slots,
                    "openings": job.openings
                }
                for job in EventJob.query.filter_by(event_id=self.id).all()
            ],
        }

    @classmethod
    def find_by(cls, field: str, value: any) -> Optional['Event']:
        try:
            return cls.query.filter_by(**{field: value}).first()
        except Exception as e:
            db.session.rollback()
            print(e)
            raise e

    @staticmethod
    def get_future_events_excluding_signed(worker_id: int, filters: Dict) -> List["Event"]:
        try:
            signed_event_ids = db.session.query(EventUsers.event_id).filter_by(worker_id=worker_id).subquery()
            query = Event.query.filter(
                Event.start_datetime > datetime.datetime.now(datetime.UTC),
                ~Event.id.in_(signed_event_ids)
            )
            if "location" in filters:
                query = query.filter(Event.location == filters["location"])
            if "job_title" in filters:
                query = query.join(EventJob).filter(
                    EventJob.job_title == filters["job_title"],
                    EventJob.openings > 0
                )
            else:
                query = query.join(EventJob).filter(EventJob.openings > 0)
            return query.all()
        except Exception as e:
            raise e

    @staticmethod
    def get_events_by_worker(worker_id: int) -> List['Event']:
        try:
            return (
                db.session.query(Event, EventUsers.status, EventJob.job_title)
                .join(EventUsers, Event.id == EventUsers.event_id)
                .join(EventJob, EventUsers.job_id == EventJob.id)
                .filter(EventUsers.worker_id == worker_id)
                .all()
            )
        except Exception as e:
            db.session.rollback()
            raise e

