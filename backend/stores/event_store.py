from datetime import datetime
from typing import List, Optional
from backend.models.event import Event, EventStatus
from backend.models.roles import Role

class EventStore:

    @staticmethod
    def create_event(name: str, start_time: datetime, end_time: datetime,
                     description: Optional[str] = None, location: Optional[str] = None,
                     status: EventStatus = EventStatus.PLANNED, advertised: bool = False) -> Event:
        event = Event(
            name=name,
            start_time=start_time,
            end_time=end_time,
            description=description,
            location=location,
            status=status,
            advertised=advertised
        )
        event.create_event()
        return event

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
