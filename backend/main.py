from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import redis

from backend.SECRETS import JWT_TOKEN
from backend.routes import user_blueprint
from backend.db import db


def create_app():
    app = Flask(__name__)
    CORS(app)

    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = JWT_TOKEN
    jwt = JWTManager(app)

    # SQLAlchemy configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://root:example@localhost:5432/my_database'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # Redis connection
    app.redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

    # Adding Routes
    app.register_blueprint(user_blueprint, url_prefix='/users')

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
