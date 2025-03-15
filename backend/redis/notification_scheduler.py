import datetime
import json
from backend.redis.redis_client import redis_client


def ensure_aware(dt: datetime.datetime) -> datetime.datetime:
    # If dt is naive, assume it's UTC and make it aware.
    if dt.tzinfo is None:
        return dt.replace(tzinfo=datetime.timezone.utc)
    return dt


def schedule_worker_reminders(event_id: int, worker_id: int, start_time: datetime.datetime):
    # Ensure the event start time is UTC-aware
    start_time = ensure_aware(start_time)

    reminders = [
        ("1 day reminder", start_time - datetime.timedelta(days=1)),
        ("1 hour reminder", start_time - datetime.timedelta(hours=1))
    ]
    # Use an aware "now" datetime
    now = datetime.datetime.now(datetime.timezone.utc)

    for reminder_type, reminder_time in reminders:
        message = f"{reminder_type} - Please confirm your attendance for event {event_id}."
        redis_client.zadd("event_reminders", {
            json.dumps({
                "worker_id": worker_id,
                "event_id": event_id,
                "message": message
            }): reminder_time.timestamp()
        })
