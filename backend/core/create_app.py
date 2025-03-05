from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from backend.SECRETS import JWT_TOKEN
from backend.routes.user_routes import user_blueprint
from backend.routes.event_routes import event_blueprint
from backend.routes.notification_routes import notifications_blueprint
from backend.db import db
from backend.core.celery_config import make_celery


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {
        "origins": ["http://localhost:3000"],  # Should be a list, not a string
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"],
        "expose_headers": ["Set-Cookie"],
        "supports_credentials": True
    }})

    app.config['JWT_SECRET_KEY'] = JWT_TOKEN
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
    app.config['JWT_REFRESH_COOKIE_PATH'] = '/users/refresh'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False
    app.config['JWT_COOKIE_SECURE'] = False
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=15)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    jwt = JWTManager(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://root:example@localhost:5432/my_database'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
    app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

    db.init_app(app)

    app.config["ENV"] = "development"
    if app.config["ENV"] == "development":
        with app.app_context():
            db.create_all()

    app.register_blueprint(user_blueprint, url_prefix='/users')
    app.register_blueprint(event_blueprint, url_prefix='/events')
    app.register_blueprint(notifications_blueprint, url_prefix='/notifications')

    return app


app = create_app()
celery = make_celery(app)  # Celery is now properly initialized
app.celery = celery
