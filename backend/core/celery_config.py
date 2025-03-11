from celery import Celery


def make_celery(app):
    celery = Celery(
        app.import_name,
        broker=app.config['CELERY']['broker_url'],
        backend=app.config['CELERY']['result_backend']
    )
    celery.conf.update(app.config['CELERY'])
    return celery
