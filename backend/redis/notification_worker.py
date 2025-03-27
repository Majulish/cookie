# notification_worker.py with pure timestamp approach
import json
import time
import logging

from backend.models.event_users import EventUsers
from backend.redis.redis_client import redis_client
from backend.stores.notification_store import NotificationStore
from backend.models.notification import Notification
from backend.models.event import Event
from backend.models.user import User
from backend.models.roles import Role
from backend.core.celery_app import celery, app

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@celery.task
def process_scheduled_reminders():
    with app.app_context():
        try:
            # Just use raw timestamp - no datetime objects at all
            current_timestamp = time.time()
            logger.info(f"Processing scheduled reminders at timestamp: {current_timestamp}")
            logger.info(f"This corresponds to: {time.ctime(current_timestamp)}")

            # Retrieve all reminders
            all_reminders = redis_client.zrange("event_reminders", 0, -1, withscores=True)
            logger.info(f"Total reminders in Redis: {len(all_reminders)}")

            # Track due reminders
            due_reminders_data = []

            for reminder_bytes, score in all_reminders:
                # Simple timestamp comparison
                is_due = score <= current_timestamp
                time_diff = current_timestamp - score

                logger.info(f"Reminder with score {score}, due at: {time.ctime(score)}")
                logger.info(f"Current timestamp: {current_timestamp}, Time difference: {time_diff} seconds")
                logger.info(f"  Is due: {is_due}")

                # If the reminder is due, add it to our processing list
                if is_due:
                    due_reminders_data.append(reminder_bytes)

            logger.info(f"Due reminders count: {len(due_reminders_data)}")

            if not due_reminders_data:
                logger.info("No due reminders found.")
                return "No due reminders"

            for reminder in due_reminders_data:
                try:
                    data = json.loads(reminder)
                    worker_id = data["worker_id"]
                    event_id = data["event_id"]
                    message = data["message"]
                    check_delay = data.get("check_delay", 0)

                    logger.info(f"Creating notification for worker {worker_id}, event {event_id}")

                    # Create the notification now that it's time
                    notif = NotificationStore.create_notification(
                        worker_id,
                        message,
                        event_id=event_id,
                        is_approved=False
                    )

                    logger.info(f"Created notification {notif['id']}")

                    # Schedule the check for approval
                    check_task = check_notification_approval.apply_async(args=[notif["id"]], countdown=check_delay)
                    logger.info(f"Scheduled check_notification_approval task: {check_task.id}")

                    # Remove this reminder from Redis
                    removed = redis_client.zrem("event_reminders", reminder)
                    logger.info(f"Removed from Redis: {removed}")
                except Exception as e:
                    logger.error(f"Error processing reminder: {reminder}")
                    logger.exception(e)
        except Exception as e:
            logger.error("Error in process_scheduled_reminders")
            logger.exception(e)

    return "done"


@celery.task
def check_notification_approval(notification_id: int):
    with app.app_context():
        try:
            logger.info(f"Checking approval for notification: {notification_id}")
            notif = Notification.find_by_id(notification_id)
            NotificationStore.update_notification(notif.id, {"is_read": True})
            if notif and not notif.is_approved:
                event = Event.find_by("id", notif.event_id)
                if not event:
                    logger.warning(f"Event {notif.event_id} not found")
                    return

                EventUsers.update_approval_count(notif.event_id, notif.user_id)
                hr_manager = User.find_by({"company_id": event.company_id, "role": Role.HR_MANAGER})
                if not hr_manager:
                    logger.warning(f"No HR manager found for company {event.company_id}")
                    return
                event = Event.find_by("id", notif.event_id)
                worker = User.find_by({"id": notif.user_id})
                hr_message = f"Worker: {worker.first_name} {worker.family_name} (ID: {notif.user_id}) has not approved their reminder for event {event.name} ({notif.event_id})."
                hr_notif = NotificationStore.create_notification(hr_manager.id, hr_message, event_id=notif.event_id)

                logger.info(f"Created HR notification: {hr_notif['id']}")
            else:
                logger.info(f"Notification {notification_id} is already approved or doesn't exist")
        except Exception as e:
            logger.error(f"Error checking approval for notification {notification_id}")
            logger.exception(e)
    return "done"


@celery.task
def force_create_test_notification(worker_id: int, event_id: int):
    """Helper function to directly create a test notification for troubleshooting"""
    with app.app_context():
        try:
            message = f"TEST NOTIFICATION: This is a direct test notification for event {event_id}"
            notif = NotificationStore.create_notification(
                worker_id,
                message,
                event_id=event_id,
                is_approved=False
            )
            logger.info(f"Created test notification {notif['id']} for worker {worker_id}")
            return f"Created test notification {notif['id']}"
        except Exception as e:
            logger.error(f"Error creating test notification")
            logger.exception(e)
            return f"Error: {str(e)}"