from flask import Flask, jsonify, request
from pymongo import MongoClient
import redis
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["cookie_db"]

# Redis connection
redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)


@app.route('/')
def index():
    return jsonify(message="Welcome to the Cookie HR management tool")


@app.route('/users')
def get_users():
    users = list(db.users.find({}, {"_id": 0}))
    return jsonify(users)


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    password = data['password']
    hashed_password = generate_password_hash(password, method='sha256')
    user_data = {
        "username": username,
        "password": hashed_password
    }
    db.users.insert_one(user_data)
    return jsonify(message="User registered successfully"), 201


@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data['username']
    password = data['password']
    user = db.users.find_one({"username": username})
    if user and check_password_hash(user['password'], password):
        return jsonify(user={"username": username}), 200
    return jsonify(message="Invalid credentials"), 401


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
