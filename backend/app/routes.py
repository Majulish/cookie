from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.app.utils import validate_input, hash_password, check_password
from models.user import User
from flask import current_app as app


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    is_valid, error_message = validate_input(username, password, email)
    if not is_valid:
        return jsonify({"message": error_message}), 400

    existing_user = User.find_by_username(username)
    if existing_user:
        return jsonify({"message": "Username already exists"}), 400

    hashed_password = hash_password(password)
    user_data = {
        "username": username,
        "password": hashed_password,
        "email": email
    }

    User.create(user_data)
    return jsonify({"message": "User registered successfully"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.find_by_username(username)
    if not user or not check_password(user['password'], password):
        return jsonify({"message": "Invalid username or password"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200


@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200
