from typing import List, Dict

from backend.db import db
from backend.stores import EventStore


class EventUsers(db.Model):
    __tablename__ = 'event_users'

    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), primary_key=True)
    worker_id = db.Column(db.String, db.ForeignKey('users.personal_id'), primary_key=True)

    def add_worker(self, worker_id: int) -> None:
        try:
            db.session.execute(EventUsers.insert().values(event_id=self.id, worker_id=worker_id))
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e


    @staticmethod
    def delete_workers_by_event(event_id: int) -> None:
        try:
            EventUsers.query.filter_by(event_id=event_id).delete()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_worker_by_personal_id(personal_id: str) -> None:
        try:
            EventUsers.query.filter_by(worker_id=personal_id).delete()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def add_worker_to_event(event_id: int, user_id: int) -> bool:
        event = EventStore.get_event_by_id(event_id)
        if event:
            event.add_worker(event_id, user_id)
            return True
        return False

    @staticmethod
    def get_workers_by_event(event_id: int) -> List[Dict[str, str]]:
        event = EventStore.get_event_by_id(event_id)
        if not event:
            return []

        workers = db.session.execute(
            db.select(EventUsers.worker_id).filter_by(event_id=event_id)
        ).scalars().all()

        if not workers:
            return []

        result = [
            {
                'worker_id': worker_id
            }
            for worker_id in workers
        ]

        return result

