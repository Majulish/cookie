from flask import request, jsonify, current_app as app
from backend.app.utils import validate_input, hash_password, check_password
from backend.models.user import User


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    password = data['password']
    email = data.get('email', '')  # assuming email is optional

    # Validate input
    valid, message = validate_input(username, password, email)
    if not valid:
        return jsonify(message=message), 400

    # Hash the password
    hashed_password = hash_password(password)
    user_data = {
        "username": username,
        "password": hashed_password,
        "email": email
    }

    # Check if the username already exists
    if User.find_by_username(username):
        return jsonify(message="Username already exists"), 400

    # Create a new user
    User.create(user_data)
    return jsonify(message="User registered successfully"), 201


@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data['username']
    password = data['password']

    # Find user by username
    user = User.find_by_username(username)
    if user and check_password(user['password'], password):
        return jsonify(user={"username": username}), 200

    return jsonify(message="Invalid credentials"), 401
