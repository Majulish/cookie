# stores/notification_store.py
from typing import List, Dict, Optional
from backend.models.notification import Notification


class NotificationStore:
    @staticmethod
    def create_notification(user_id: int, message: str, event_id: Optional[int] = None) -> Dict:
        notif = Notification.create_notification(user_id, message, event_id)
        return {
            "id": notif.id,
            "user_id": notif.user_id,
            "message": notif.message,
            "is_read": notif.is_read,
            "event_id": notif.event_id,
            "created_at": notif.created_at.isoformat(),
        }

    @staticmethod
    def get_user_notifications(user_id: int) -> List[Dict]:
        notifications = Notification.query.filter_by(user_id=user_id).all()
        return [n.to_dict() for n in notifications]

    @staticmethod
    def mark_notifications_as_read(notification_ids: list, user_id: int) -> int:
        """
        Calls the Notification model method to mark notifications as read.
        """
        return Notification.mark_notification_as_read(notification_ids, user_id)

