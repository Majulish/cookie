import json
import datetime

from backend.models.event import Event
from backend.redis.redis_client import redis_client
from backend.models.notification import Notification
from backend.stores.notification_store import NotificationStore
from backend.stores.user_store import UserStore  # Assumes you have a method to get the HR manager
from backend.core.create_app import celery, app  # Import celery and app for context


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


@celery.task
def check_overdue_reminders():
    with app.app_context():
        now = datetime.datetime.now(datetime.timezone.utc)
        # Overdue for the 1-hour reminder: more than 20 minutes have passed since notification creation.
        overdue_1hour = Notification.query.filter(
            Notification.reminder_type == "1_hour_before",
            Notification.is_approved is False,
            Notification.created_at <= now - datetime.timedelta(minutes=20)
        ).all()

        # Overdue for the 1-day reminder: more than 3 hours have passed since creation.
        overdue_1day = Notification.query.filter(
            Notification.reminder_type == "1_day_before",
            Notification.is_approved is False,
            Notification.created_at <= now - datetime.timedelta(hours=3)
        ).all()

        for notif in overdue_1hour + overdue_1day:
            # Get the worker and their HR manager.
            worker = UserStore.find_user("id", notif.user_id)
            if worker:
                hr_manager = UserStore.get_hr_manager(worker)
                if hr_manager:
                    # Compose a message for the HR manager.
                    message = (f"Worker {worker.first_name} {worker.family_name} has not approved "
                               f"their '{notif.reminder_type}' reminder for event {notif.event_id}.")
                    # Create a new notification for the HR manager.
                    NotificationStore.create_notification(hr_manager.id, message, event_id=notif.event_id)
        return "done"
