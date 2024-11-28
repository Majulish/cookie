from backend.db import db
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Dict
from backend.models.user import User
from backend.models.event_job import EventJob


class EventUsers(db.Model):
    __tablename__ = 'event_users'

    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('event_jobs.id'), nullable=False)

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
    def add_worker_to_event(event_id: int, worker_id: int, job_id: int) -> bool:
        """
        Adds a worker to a specific job in an event.
        """
        from backend.models.event import Event  # Lazy import to prevent circular imports
        try:
            event = Event.find_by(id=event_id)
            if event:
                db.session.execute(
                    EventUsers.__table__.insert().values(event_id=event_id, worker_id=worker_id, job_id=job_id)
                )
                db.session.commit()
                return True
            return False
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_workers_by_event(event_id: int) -> List[Dict[str, str]]:
        """
        Retrieves a list of workers for a specific event with their assigned jobs.
        """

        try:
            workers = (
                db.session.query(User, EventJob)
                .join(EventUsers, User.personal_id == EventUsers.worker_id)
                .join(EventJob, EventUsers.job_id == EventJob.id)
                .filter(EventUsers.event_id == event_id)
                .all()
            )

            return [
                {
                    "worker_id": worker.id,
                    "name": f"{worker.first_name} {worker.family_name}",
                    "job_title": job.job_title
                }
                for worker, job in workers
            ]
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

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
        db.session.add(self)
        db.session.commit()