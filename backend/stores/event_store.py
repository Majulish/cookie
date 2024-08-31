from typing import List, Optional
import json

from backend.models.event import Event
from backend.models.user import User
from backend.db import db
from sqlalchemy import text


class EventStore:
    @staticmethod
    def create_event(new_event):
        event = Event(
            id=new_event['id'],
            name=new_event['name'],
            start_time=new_event['start_time'],
            end_time=new_event['end_time'],
            description=new_event['description'],
            location=new_event['location'],
            status=new_event['status'],
            advertised=new_event['advertised']
        )
        event.create_event()
        result = {
            'id': event.id,
            'name': event.name,
            'start_time': event.start_time.isoformat(),
            'end_time': event.end_time.isoformat(),
            'description': event.description,
            'location': event.location,
            'status': event.status.value,
            'advertised': event.advertised
        }
        json_result = json.dumps(result)
        print(json_result)
        return json_result

    @staticmethod
    def get_event_by_id(event_id: int) -> Optional[Event]:
        return Event.query.get(event_id)

    @staticmethod
    def update_event(event_id: int, data: dict) -> Optional[Event]:
        event = EventStore.get_event_by_id(event_id)
        if event:
            for key, value in data.items():
                if hasattr(event, key):
                    setattr(event, key, value)
            event.save_to_db()
            return event
        return None

    @staticmethod
    def delete_event(event_id: int) -> bool:
        event = EventStore.get_event_by_id(event_id)
        if event:
            event.delete()
            return True
        return False

    @staticmethod
    def delete_worker(event_id: int) -> None:
        db.session.execute(
            text('DELETE FROM worker WHERE event_id = :event_id'),
            {'event_id': event_id}
        )

        db.session.commit()

    @staticmethod
    def delete_worker_by_personal_id(personal_id: str) -> None:
        db.session.execute(
            text('DELETE FROM worker WHERE worker_id = :personal_id'),
            {'personal_id': personal_id}
        )

        db.session.commit()

    @staticmethod
    def add_worker_to_event(event_id: int, user_id: int) -> bool:
        event = EventStore.get_event_by_id(event_id)
        if event:
            event.add_worker(event_id, user_id)
            return True
        return False

    @staticmethod
    def add_job_to_event(event_id: int, job_id: int, openings: int) -> bool:
        event = EventStore
        if event:
            event.add_job_to_event(event_id, job_id, openings)
            return True
        return False

    @staticmethod
    def get_all_events() -> List[Event]:
        return Event.query.all()

    @staticmethod
    def get_workers_by_event(event_id: int) -> List[dict]:
        event = EventStore.get_event_by_id(event_id)
        if event:
            # Query the worker table to get worker IDs for the event
            worker_ids = db.session.execute(
                text('SELECT worker_id FROM worker WHERE event_id = :event_id'),
                {'event_id': event_id}
            ).fetchall()

            # Extract worker IDs from the result
            worker_ids = [row[0] for row in worker_ids]

            # Fetch worker details from User model
            workers = User.query.filter(User.personal_id.in_(worker_ids)).all()

            # Convert worker objects to dictionaries
            result = [
                {
                    'personal_id': worker.personal_id,
                    'email': worker.email
                }
                for worker in workers
            ]
            return result
        return []
