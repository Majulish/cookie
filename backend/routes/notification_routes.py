from flask import Blueprint, request, jsonify

from backend.models.roles import has_permission, Permission
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


@notifications_blueprint.route("/<int:notification_id>/approve", methods=["PUT"])
@load_user
def approve_notification(user, notification_id):
    if not has_permission(user.role, Permission.APPLY_FOR_JOBS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403
    body = request.get_json()
    if not body or "message" not in body:
        return jsonify({"error": "Message is required"}), 400

    result = NotificationStore.update_notification(notification_id, {"is_approved": True, "is_read": True})
    return jsonify(result), 200


@notifications_blueprint.route("/<int:notification_id>/read", methods=["PUT"])
@load_user
def mark_notification_as_read(user, notification_id): # is this a potential security verification issue?
    """Endpoint for workers to mark a notification as read so it won't show again."""
    body = request.get_json()
    if not body or "message" not in body:
        return jsonify({"error": "Message is required"}), 400
    result = NotificationStore.update_notification(notification_id, {"is_read": True})
    return jsonify(result), 200
