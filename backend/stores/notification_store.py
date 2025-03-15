# stores/notification_store.py
from typing import List, Dict, Optional
from backend.models.notification import Notification


class NotificationStore:
    @staticmethod
    def create_notification(user_id: int, message: str, event_id: int = None, is_approved: bool = False) -> Dict:
        # Create the Notification record via your Notification model’s method.
        notif = Notification.create_notification(user_id, message, event_id, is_approved=is_approved)
        return {
            "id": notif.id,
            "user_id": notif.user_id,
            "message": notif.message,
            "is_approved": notif.is_approved,
            "event_id": notif.event_id,
            "created_at": notif.created_at.isoformat(),
        }

    @staticmethod
    def get_user_notifications(user_id: int) -> List[Dict]:
        notifications = Notification.query.filter_by(user_id=user_id).all()
        return [n.to_dict() for n in notifications]

    @staticmethod
    def update_notification(notification_id: int, update_data: dict) -> dict:
        notification = Notification.find_by_id(notification_id)
        if not notification:
            return {"error": "Notification not found"}
        for key, value in update_data.items():
            setattr(notification, key, value)
        try:
            notification.save_to_db()
            return notification.to_dict()
        except Exception as e:
            return {"error": str(e)}
