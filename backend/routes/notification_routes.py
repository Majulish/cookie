from flask import Blueprint, request, jsonify

from backend.models.roles import has_permission, Permission
from backend.stores import EventUsersStore, UserStore
from backend.utils.decorators import load_user
from backend.stores.notification_store import NotificationStore

notifications_blueprint = Blueprint('notifications', __name__)


@notifications_blueprint.route("/", methods=["GET"])
@load_user
def get_notifications(user):
    """Fetch current user's notifications."""
    data = NotificationStore.get_user_notifications(user.id)
    return jsonify(data), 200


@notifications_blueprint.route("/", methods=["POST"])
@load_user
def create_notification(user):
    """Create a new notification (e.g., for user to test)."""
    body = request.get_json()
    if not body or "message" not in body:
        return jsonify({"error": "Message is required"}), 400

    new_note = NotificationStore.create_notification(user.id, body["message"])
    return jsonify(new_note), 201


@notifications_blueprint.route("/mark_read", methods=["POST"])
@load_user
def mark_notifications_as_read(user):
    data = request.get_json()
    notification_ids = data.get("notification_ids")

    if not notification_ids or not isinstance(notification_ids, list):
        return jsonify({"error": "Invalid input, expected an array of notification IDs"}), 400

    updated_count = NotificationStore.mark_notifications_as_read(notification_ids, user.id)

    return jsonify({"message": f"Marked {updated_count} notifications as read"}), 200


@notifications_blueprint.route("/<int:notification_id>/approve", methods=["PUT"])
@load_user
def approve_notification(user, notification_id):
    if not has_permission(user.role, Permission.APPLY_FOR_JOBS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403

    body = request.get_json()
    if not body:
        return jsonify({"error": "Event id is required"}), 400

    result = NotificationStore.update_notification(notification_id, {"is_approved": True, "is_read": True})
    event_id = body.get("event_id")
    if not event_id:
        return jsonify({"error": "Event id is required"}), 400
    update_result, status = EventUsersStore.update_event_worker_approval_status(event_id, user.id)
    if status != 200:
        return jsonify(update_result), status

    return jsonify(result), 200
