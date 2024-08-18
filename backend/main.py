from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import redis
from flask_sqlalchemy import SQLAlchemy


from backend.SECRETS import JWT_TOKEN
from backend.routes import user_blueprint


def create_app():
    app: Flask = Flask(__name__)
    CORS(app)

    app.config['JWT_SECRET_KEY'] = JWT_TOKEN
    jwt = JWTManager(app)

    # SQLAlchemy configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@localhost:5432/cookie_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    app.db = db
    # Redis connection
    app.redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

    # Adding Routes
    app.register_blueprint(user_blueprint, url_prefix='/users')

    return app


db = SQLAlchemy()
app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
