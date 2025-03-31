import datetime
import json
import time
import logging

from backend.stores.notification_store import NotificationStore
from backend.redis.redis_client import redis_client

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def schedule_worker_reminders(event_id: int, worker_id: int, start_time: datetime.datetime):
    """
    Schedule reminder notifications for a worker for an event

    Args:
        event_id: The ID of the event
        worker_id: The ID of the worker
        start_time: The start time of the event
    """
    # Convert datetime to timestamp, treating naive datetimes as local time (Israel, UTC+2)
    if start_time.tzinfo is not None:
        event_timestamp = start_time.timestamp()
    else:
        # If no timezone, treat as local time (Israel, UTC+3)
        israel_tz = datetime.timezone(datetime.timedelta(hours=3))
        event_timestamp = start_time.replace(tzinfo=israel_tz).timestamp()

    # Get current timestamp
    current_timestamp = time.time()

    # Log in terms of timestamps and human-readable time
    logger.info(f"Scheduling reminders for event {event_id}, worker {worker_id}")
    logger.info(f"Event timestamp: {event_timestamp}, time: {time.ctime(event_timestamp)}")
    logger.info(f"Current timestamp: {current_timestamp}, time: {time.ctime(current_timestamp)}")
    logger.info(f"Time to event: {(event_timestamp - current_timestamp) / 3600:.2f} hours")

    # Define reminders in terms of seconds before event
    reminders = [
        {
            "label": "27_hours_before",
            "seconds_before": 27 * 3600,  # 27 hours in seconds
            "check_delay": 3 * 3600  # 3 hours in seconds
        },
        {
            "label": "1_hour_before",
            "seconds_before": 1 * 3600,  # 1 hour in seconds
            "check_delay": 20 * 60  # 20 minutes in seconds
        }
    ]

    # Before adding new reminders, check and remove any existing ones for this event/worker
    all_reminders = redis_client.zrange("event_reminders", 0, -1)
    for reminder_bytes in all_reminders:
        try:
            reminder_data = json.loads(reminder_bytes)
            if (reminder_data.get("event_id") == event_id and
                    reminder_data.get("worker_id") == worker_id):
                redis_client.zrem("event_reminders", reminder_bytes)
                logger.info(f"Removed existing reminder for event {event_id}, worker {worker_id}")
        except Exception as e:
            logger.warning(f"Error processing existing reminder: {e}")

    for reminder in reminders:
        # Calculate reminder time based on event time
        reminder_timestamp = event_timestamp - reminder["seconds_before"]

        # Log in terms of timestamps and human-readable time
        logger.info(f"Reminder {reminder['label']} timestamp: {reminder_timestamp}")
        logger.info(f"Reminder time: {time.ctime(reminder_timestamp)}")

        # Calculate time difference from now
        time_diff_seconds = reminder_timestamp - current_timestamp
        logger.info(f"Time until this reminder: {time_diff_seconds / 60:.2f} minutes")

        # Don't schedule past reminders
        if time_diff_seconds <= 0:
            logger.info(f"Skipping {reminder['label']} as it's already past")
            continue

        from backend.stores import EventStore
        event = EventStore.get_event_by("id", event_id)
        message = f"Reminder ({reminder['label']}): Please confirm your attendance for event: {event.name} ."

        # Store the reminder data
        reminder_data = {
            "worker_id": worker_id,
            "event_id": event_id,
            "message": message,
            "label": reminder["label"],
            "check_delay": reminder["check_delay"]
        }

        # Convert to JSON and add to Redis sorted set
        reminder_json = json.dumps(reminder_data)

        # The score is the timestamp when the reminder should trigger
        result = redis_client.zadd(
            "event_reminders",
            {reminder_json: reminder_timestamp}
        )
        logger.info(f"Redis zadd result: {result}")

    # Check what's in Redis after scheduling
    all_reminders = redis_client.zrange("event_reminders", 0, -1, withscores=True)
    logger.info(f"Total reminders in Redis after scheduling: {len(all_reminders)}")

    # For testing/debugging, check for due reminders
    due_reminders = []
    for reminder_bytes, score in all_reminders:
        if score <= current_timestamp:
            due_reminders.append(reminder_bytes)

    logger.info(f"Reminders due now: {len(due_reminders)}")
    for r in due_reminders:
        logger.info(f"Due reminder: {r}")