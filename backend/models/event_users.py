import datetime
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Dict
from enum import Enum

from backend.models.user import User
from backend.models.event_job import EventJob
from backend.db import db
from backend.redis.notification_scheduler import schedule_worker_reminders


class WorkerStatus(Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    BACKUP = "BACKUP"
    DONE = "DONE"


class EventUsers(db.Model):
    __tablename__ = 'event_users'

    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('event_jobs.id'), nullable=False)
    status = db.Column(db.Enum(WorkerStatus), default=WorkerStatus.PENDING.value)

    def add_worker(self, worker_id: str, job_id: int) -> None:
        """
        Adds a worker to a specific job in the event.
        """
        try:
            db.session.execute(
                EventUsers.__table__.insert().values(event_id=self.event_id, worker_id=worker_id, job_id=job_id)
            )
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_workers_by_event(event_id: int) -> None:
        """
        Deletes all workers associated with a specific event.
        """
        try:
            EventUsers.query.filter_by(event_id=event_id).delete()
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_worker_by_personal_id(personal_id: str) -> None:
        """
        Deletes a worker from all events by their personal ID.
        """
        try:
            EventUsers.query.filter_by(worker_id=id).delete()
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def assign_worker(event_id: int, worker_id: int, job_id: int, status: WorkerStatus) -> None:
        """
        Creates or updates the EventUsers row to link worker to an event
        with a job & specified status, committing DB changes.
        If status is APPROVED, decrement job openings.
        """
        try:
            existing = EventUsers.query.filter_by(event_id=event_id, worker_id=worker_id).first()
            is_already_approved = existing and existing.status == WorkerStatus.APPROVED
            is_job_new = existing and existing.job_id != job_id
            if existing:
                if is_already_approved and is_job_new:
                    old_job = EventJob.query.get(existing.job_id)
                    old_job.openings += 1
                existing.job_id = job_id
                existing.status = status.value
            else:
                new_entry = EventUsers(
                    event_id=event_id,
                    worker_id=worker_id,
                    job_id=job_id,
                    status=status.value
                )
                db.session.add(new_entry)

            # Decrement openings
            if status == WorkerStatus.APPROVED and (not is_already_approved or is_job_new):
                job = EventJob.query.get(job_id)
                if job and job.openings > 0:

                    # event.start_datetime is assumed available from your event record.
                    from backend.models.event import Event
                    event = Event.query.get(event_id)
                    schedule_worker_reminders(event_id, worker_id, event.start_datetime)
                    job.openings -= 1
                    db.session.add(job)

            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_workers_detailed(event_id: int) -> List[Dict]:
        """
        Performs a join across User, EventUsers, and EventJob, returning
        each worker's name, job title, and status for a given event.
        """
        try:
            results = (
                db.session.query(User, EventUsers, EventJob)
                .join(EventUsers, User.id == EventUsers.worker_id)
                .join(EventJob, EventUsers.job_id == EventJob.id)
                .filter(EventUsers.event_id == event_id)
                .all()
            )

            output = []
            for user, eu, job in results:
                # If enum, .value ensures an uppercase string like "PENDING"
                status_str = eu.status.value if hasattr(eu.status, "value") else str(eu.status)
                output.append({
                    "worker_id": user.id,
                    "name": f"{user.first_name} {user.family_name}",
                    "job_title": job.job_title,
                    "age": datetime.datetime.now().year - datetime.datetime.strptime
                    (user.birthdate, "%d/%m/%Y").year,
                    "city": user.city or "unknown",
                    "phone": user.phone_number,
                    "status": status_str
                })

            return output
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Error in get_workers_detailed: {e}")
            return []

    @staticmethod
    def get_worker_job(event_id: int, worker_id: int):
        """
        Retrieves the job assigned to a specific worker for a specific event.
        """
        try:
            return EventUsers.query.filter_by(event_id=event_id, worker_id=worker_id).first()
        except Exception as e:
            raise Exception(f"Error fetching worker job: {e}")

    def save_to_db(self) -> None:
        try:
            db.session.add(self)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e
