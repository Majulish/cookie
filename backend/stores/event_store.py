from datetime import datetime
from typing import List, Optional
from backend.models.event import Event, EventStatus
from backend.models.roles import Role
import json


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
    def add_worker_to_event(event_id: int, user_id: int) -> bool:
        event = EventStore.get_event_by_id(event_id)
        if event:
            event.add_worker(user_id)
            return True
        return False

    @staticmethod
    def add_job_to_event(event_id: int, job_id: int) -> bool:
        event = EventStore.get_event_by_id(event_id)
        if event:
            event.add_job(job_id)
            return True
        return False

    @staticmethod
    def get_all_events() -> List[Event]:
        return Event.query.all()