from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import redis
from datetime import timedelta

from backend.SECRETS import JWT_TOKEN
from backend.routes import user_blueprint, event_blueprint
from backend.db import db


def create_app():
    app = Flask(__name__)
    # CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})
    CORS(app, resources={
        r"/*": {
            "origins": "http://localhost:3000",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"],
            "expose_headers": ["Set-Cookie"],
            "supports_credentials": True
        }
    })

    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = JWT_TOKEN
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
    app.config['JWT_REFRESH_COOKIE_PATH'] = '/users/refresh'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Set True in production
    app.config['JWT_COOKIE_SECURE'] = False  # Set True in production (requires HTTPS)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=15) #TODO change to minutes
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    jwt = JWTManager(app)

  

    # SQLAlchemy configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://root:example@localhost:5432/my_database'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    app.config["ENV"] = "development"
    if app.config["ENV"] == "development":
        with app.app_context():
            db.create_all()

    # Redis connection
    app.redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

    # Adding Routes
    app.register_blueprint(user_blueprint, url_prefix='/users')
    app.register_blueprint(event_blueprint, url_prefix='/events')

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
