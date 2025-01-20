from typing import List, Dict
from backend.models.notification import Notification


class NotificationStore:
    @staticmethod
    def create_notification(user_id: int, message: str) -> Dict:
        """High-level logic to create a notification."""
        notification = Notification.create_notification(user_id, message)
        return {
            "id": notification.id,
            "user_id": notification.user_id,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat()
        }

    @staticmethod
    def get_notifications(user_id: int) -> List[Dict]:
        """Returns all notifications for a specific user."""
        # Filter in the model or here as needed
        notifications = Notification.query.filter_by(user_id=user_id).all()
        return [
            {
                "id": n.id,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            }
            for n in notifications
        ]
