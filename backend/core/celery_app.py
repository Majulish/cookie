from backend.core.app_factory import create_app
from backend.core.celery_config import make_celery


def make_celery_app():
    # Local imports avoid circular dependencies.
    my_app = create_app()
    my_celery = make_celery(my_app)
    my_app.celery = my_celery
    return my_app, my_celery


app, celery = make_celery_app()
