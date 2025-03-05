import json
import datetime
from backend.redis.redis_client import redis_client
from backend.stores.notification_store import NotificationStore
from backend.models.event import Event
from backend.core.create_app import celery  # Corrected import


@celery.task
def process_scheduled_reminders():
    current_timestamp = datetime.datetime.now(datetime.UTC).timestamp()
    reminders = redis_client.zrangebyscore("event_reminders", 0, current_timestamp)

    for reminder in reminders:
        data = json.loads(reminder)
        worker_id = data["worker_id"]
        event_id = data["event_id"]
        reminder_type = data["reminder_type"]

        event = Event.find_by("id", event_id)
        if event:
            message = f"Reminder: Confirm your attendance for '{event.name}' ({reminder_type.replace('_', ' ')})."
            NotificationStore.create_notification(worker_id, message, event_id=event_id)

        redis_client.zrem("event_reminders", reminder)
