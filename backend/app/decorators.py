# decorators.py
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt
from flask import jsonify
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
