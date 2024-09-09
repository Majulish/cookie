from flask import request, jsonify, Blueprint, Response, redirect, make_response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, set_access_cookies, \
    unset_jwt_cookies, create_refresh_token, set_refresh_cookies
from pydantic import ValidationError
from typing import Tuple
from datetime import timedelta

from backend.stores import UserStore
from backend.models.schemas import SignupRequest, LoginRequest
from backend.app.auth import check_password

user_blueprint = Blueprint('users', __name__)
ACCESS_EXPIRES = timedelta(hours=1)


@user_blueprint.route('/signup', methods=['POST'])
def signup() -> Tuple[Response, int]:
    try:
        data = SignupRequest(**request.get_json())
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    existing_user = UserStore.find_user_by_username(data.username)
    if existing_user:
        return jsonify({"message": "Username already exists"}), 400

    UserStore.create_user(data.model_dump())
    return jsonify({"message": "User registered successfully"}), 201


@user_blueprint.route('/signin', methods=['POST'])
def signin() -> Tuple[Response, int]:
    try:
        data = LoginRequest(**request.get_json())
    except ValidationError as e:
        return jsonify(e.errors()), 400

    user = UserStore.find_user_by_username(data.username)
    if not user or not check_password(user.password_hash, data.password):
        return jsonify({"message": "Invalid username or password"}), 401

    access_token = create_access_token(identity={'username': data.username, 'role': user.role.value})
    refresh_token = create_refresh_token(identity={'username': data.username, 'role': user.role.value})

    response = make_response(redirect("/", code=302))

    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)

    return response, 302


@user_blueprint.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user, expires_delta=timedelta(minutes=15))

    response = make_response(jsonify({"access_token": new_access_token}), 200)
    response.set_cookie('access_token', new_access_token, httponly=True)

    return response


@user_blueprint.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)  # Clear JWT cookies
    return response, 200


@user_blueprint.route('/update', methods=['PUT'])
@jwt_required()
def update_user() -> Tuple[Response, int]:
    current_user = get_jwt_identity()
    user = UserStore.find_user_by_username(current_user['username'])
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    updated_user = UserStore.update_user(user.id, data)
    return jsonify({"message": "User updated successfully"}), 200


@user_blueprint.route('/delete', methods=['DELETE'])
@jwt_required()
def delete_user() -> Tuple[Response, int]:
    current_user = get_jwt_identity()
    user = UserStore.find_user_by_username(current_user['username'])
    if not user:
        return jsonify({"message": "User not found"}), 404

    UserStore.delete_user(user.id)
    return jsonify({"message": "User deleted successfully"}), 200
