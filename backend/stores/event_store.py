from typing import List, Optional, Tuple
import json

from flask import jsonify, Response
from backend.models.event import Event
from backend.models.user import User
from backend.models.event_workers import EventWorkers


class EventStore:
    @staticmethod
    def create_event(new_event):
        event = Event(
            event_id=new_event['id'],
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
    def update_event(event: Event) -> tuple[Response, int] | dict:
        if not EventStore.get_event_by_id(event.event_id):
            return jsonify({"error": "Event not found."}), 404

        for key, value in event.items():
            if hasattr(event, key):
                setattr(event, key, value)
        event.save_to_db()
        return event

    @staticmethod
    def delete_event(event_id: int) -> bool:
        event = EventStore.get_event_by_id(event_id)
        if event:
            event.delete()
            return True
        return False


    @staticmethod
    def get_all_events() -> List[Event]:
        return Event.query.all()

    @staticmethod
    def get_workers_by_event(event_id: int) -> tuple[Response, int]:
        # Fetch the event
        event = EventStore.get_event_by_id(event_id)
        if not event:
            return jsonify({"error": "Event not found."}), 404

        workers = (
            User.query
            .join(EventWorkers, User.id == EventWorkers.user_id)
            .filter(EventWorkers.event_id == event_id)
            .all()
        )

        worker_data = [{
            "id": worker.id,
            "name": worker.name,
            "email": worker.email,
            "role": worker.role.value
        } for worker in workers]

        return jsonify(worker_data), 200




