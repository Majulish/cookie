from typing import List, Dict
from backend.db import db
from sqlalchemy.exc import SQLAlchemyError


class EventUsers(db.Model):
    __tablename__ = 'event_users'

    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), primary_key=True)
    worker_id = db.Column(db.String, db.ForeignKey('users.personal_id'), primary_key=True)

    def add_worker(self, worker_id: str) -> None:
        """
        Adds a worker to the event.
        """
        try:
            db.session.execute(
                EventUsers.__table__.insert().values(event_id=self.event_id, worker_id=worker_id)
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
            EventUsers.query.filter_by(worker_id=personal_id).delete()
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def add_worker_to_event(event_id: int, user_id: str) -> bool:
        """
        Adds a worker to a specific event.
        """
        from backend.models.event import Event  # Lazy import to prevent circular imports
        try:
            event = Event.find_by(id=event_id)
            if event:
                db.session.execute(
                    EventUsers.__table__.insert().values(event_id=event_id, worker_id=user_id)
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
        Retrieves a list of workers for a specific event.
        """
        from backend.models.user import User  # Lazy import to prevent circular imports
        try:
            workers = (
                db.session.query(User)
                .join(EventUsers, User.personal_id == EventUsers.worker_id)
                .filter(EventUsers.event_id == event_id)
                .all()
            )

            return [
                {
                    "id": worker.personal_id,
                    "name": f"{worker.first_name} {worker.family_name}"
                }
                for worker in workers
            ]
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e
