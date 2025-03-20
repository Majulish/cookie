import datetime

from backend.stores.notification_store import NotificationStore


def ensure_aware(dt: datetime.datetime) -> datetime.datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=datetime.timezone.utc)
    return dt


def schedule_worker_reminders(event_id: int, worker_id: int, start_time: datetime.datetime):
    start_time = ensure_aware(start_time)
    now = datetime.datetime.now(datetime.timezone.utc)
    reminders = [
        {
            "label": "1_day_before",
            "scheduled_time": start_time - datetime.timedelta(days=1),
            "check_delay": 3 * 3600  # 3 hours in seconds
        },
        {
            "label": "1_hour_before",
            "scheduled_time": start_time - datetime.timedelta(hours=1),
            "check_delay": 20 * 60  # 20 minutes
        }
    ]

    from backend.redis.notification_worker import check_notification_approval

    for reminder in reminders:
        scheduled_time = reminder["scheduled_time"]
        message = f"Reminder ({reminder['label']}): Please confirm your attendance for event {event_id}."
        notif = NotificationStore.create_notification(worker_id, message, event_id=event_id, is_approved=False)
        check_notification_approval.apply_async(args=[notif["id"]], countdown=reminder["check_delay"])
