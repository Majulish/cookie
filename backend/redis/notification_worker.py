# backend/redis/notification_worker.py
import json
import datetime
from backend.redis.redis_client import redis_client
from backend.stores.notification_store import NotificationStore
from backend.models.notification import Notification
from backend.models.event import Event
from backend.models.user import User
from backend.models.roles import Role
from backend.core.celery_app import celery, app


@celery.task
def process_scheduled_reminders():
    with app.app_context():
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


@celery.task
def check_notification_approval(notification_id: int):
    with ((app.app_context())):
        notif = Notification.find_by_id(notification_id)
        if notif and not notif.is_approved:
            # Retrieve the event to get company info.
            if not (event := Event.find_by("id", notif.event_id)) \
                    or not (hr_manager := User.find_by({"company_id": event.company_id, "role": Role.HR_MANAGER})):
                return
            hr_message = f"Worker (ID: {notif.user_id}) has not approved their reminder for event {notif.event_id}."
            NotificationStore.create_notification(hr_manager.id, hr_message, event_id=notif.event_id)
    return "done"
