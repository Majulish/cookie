from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
import redis
from SECRETS import JWT_TOKEN


def create_app():
    app: Flask = Flask(__name__)
    CORS(app)

    app.config['JWT_SECRET_KEY'] = JWT_TOKEN
    jwt = JWTManager(app)

    # MongoDB connection
    app.config["MONGO_URI"] = "mongodb://root:example@localhost:27017/cookie_db?authSource=admin"
    app.mongo_client = MongoClient(app.config["MONGO_URI"])
    app.db = app.mongo_client["cookie_db"]

    # Redis connection
    app.redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

    with app.app_context():
        from backend.app import routes

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8000)
