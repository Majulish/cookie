import json
import datetime
from backend.redis.redis_client import redis_client


def schedule_worker_reminders(event_id: int, worker_id: int, start_time: datetime.datetime):
    reminders = [
        ("1_hour_before", start_time - datetime.timedelta(hours=1)),
        ("1_day_before", start_time - datetime.timedelta(days=1))
    ]
    for reminder_type, reminder_time in reminders:
        if reminder_time > datetime.datetime.now(datetime.UTC):
            redis_client.zadd("event_reminders", {
                json.dumps({
                    "worker_id": worker_id,
                    "event_id": event_id,
                    "reminder_type": reminder_type
                }): reminder_time.timestamp()
            })
