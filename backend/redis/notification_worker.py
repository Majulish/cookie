import json
import datetime
from backend.redis.redis_client import redis_client
from backend.stores.notification_store import NotificationStore
from backend.models.event import Event
from backend.core.create_app import celery, app


@celery.task
def process_scheduled_reminders():
    with app.app_context():  # Push an application context
        current_timestamp = datetime.datetime.now(datetime.UTC).timestamp()
        reminders = redis_client.zrangebyscore("event_reminders", 0, current_timestamp)
        for reminder in reminders:
            data = json.loads(reminder)
            worker_id = data["worker_id"]
            event_id = data["event_id"]
            message = data["message"]

            event = Event.find_by("id", event_id)
            if event:
                NotificationStore.create_notification(
                    worker_id,
                    message,
                    event_id=event_id,
                    is_approved=False
                )
            redis_client.zrem("event_reminders", reminder)
    return "done"
