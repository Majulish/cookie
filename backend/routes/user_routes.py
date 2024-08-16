from flask import request, jsonify, Response, Blueprint, current_app as app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from pydantic import ValidationError
from typing import Tuple

from backend.models.schemas import SignupRequest, LoginRequest
from backend.app.auth import hash_password, check_password
from backend.models.user import User

user_blueprint = Blueprint('users', __name__)


@user_blueprint.route('/signup', methods=['POST'])
def signup() -> Tuple[Response, int]:
    try:
        data = SignupRequest(**request.get_json())
    except ValidationError as e:
        return jsonify(e.errors()), 400

    existing_user = User.find_by_username(data.username)
    if existing_user:
        return jsonify({"message": "Username already exists"}), 400

    hashed_password = hash_password(data.password)
    user_data = {
        "username": data.username,
        "password": hashed_password,
        "email": data.email,
        "role": data.role.value  # Store the role as its value (string)
    }

    User.create(user_data)
    return jsonify({"message": "User registered successfully"}), 201


@user_blueprint.route('/login', methods=['POST'])
def login() -> Tuple[Response, int]:
    try:
        data = LoginRequest(**request.get_json())
    except ValidationError as e:
        return jsonify(e.errors()), 400

    user = User.find_by_username(data.username)
    if not user or not check_password(user['password'], data.password):
        return jsonify({"message": "Invalid username or password"}), 401
    role = user.get('role', 'worker')  # Default role is worker

    access_token = create_access_token(identity={'username': data.username, 'role': role})
    return jsonify(access_token=access_token), 200


@user_blueprint.route('/protected', methods=['GET'])
@jwt_required()
def protected() -> Tuple[Response, int]:
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@user_blueprint.route('/admin', methods=['GET'])
@jwt_required()
def admin_only() -> tuple[Response, int]:
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({"message": "Access denied"}), 403

    return jsonify({"message": "Welcome, Admin!"}), 200
