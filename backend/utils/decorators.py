from flask_jwt_extended import jwt_required, get_jwt
from functools import wraps
from flask import jsonify
from backend.models.roles import has_permission, Permission
from backend.stores import UserStore


def load_user(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        jwt_data = get_jwt().get("sub", {})
        if not jwt_data or "username" not in jwt_data:
            return jsonify({"error": "Authentication required"}), 401
        user = UserStore.find_user("username", jwt_data["username"])
        if not user:
            return jsonify({"error": "User not found"}), 404
        return fn(user, *args, **kwargs)

    return wrapper


def permission_required(permission: Permission):
    """
    Decorator that checks if the current user (provided by load_user)
    has the required permission.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(user, *args, **kwargs):
            if not has_permission(user.role, permission):
                return jsonify({"error": "Unauthorized. Insufficient permissions."}), 403
            return fn(user, *args, **kwargs)
        return wrapper
    return decorator
