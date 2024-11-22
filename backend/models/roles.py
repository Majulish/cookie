from enum import Enum
from flask import jsonify
from flask_jwt_extended import get_jwt


class Role(Enum):
    WORKER = "worker"
    HR_MANAGER = "hr_manager"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class Permission(Enum):
    # Event-related permissions
    VIEW_EVENTS = "view_events"  # View event details and available jobs.
    MANAGE_EVENTS = "manage_events"  # Create, update, and delete events.

    # Worker-related permissions
    APPLY_FOR_JOBS = "apply_for_jobs"  # Workers apply for jobs in events.
    ASSIGN_WORKERS = "assign_workers"  # Assign workers to specific jobs in events.

    # Application-related permissions
    MANAGE_APPLICATIONS = "manage_applications"  # Approve/reject worker applications.


ROLE_PERMISSIONS = {
    Role.WORKER: [
        Permission.VIEW_EVENTS,
        Permission.APPLY_FOR_JOBS,
    ],
    Role.HR_MANAGER: [
        Permission.VIEW_EVENTS,
        Permission.MANAGE_EVENTS,
        Permission.ASSIGN_WORKERS,
    ],
    Role.RECRUITER: [
        Permission.VIEW_EVENTS,
        Permission.MANAGE_APPLICATIONS,
        Permission.MANAGE_EVENTS,
    ],
    Role.ADMIN: list(Permission),  # Admin gets all permissions
}


def has_permission(user_role: Role, permission: Permission) -> bool:
    return permission in ROLE_PERMISSIONS.get(user_role, [])


def check_permission(required_permission: Permission):
    jwt_data = get_jwt()
    if not jwt_data or "role" not in jwt_data:
        return jsonify({"error": "Unauthorized"}), 403

    current_role = jwt_data["role"]
    if not has_permission(Role(current_role), required_permission):
        return jsonify({"error": "Permission denied"}), 403

    return None
