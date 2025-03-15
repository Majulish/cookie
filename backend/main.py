import threading
import time
from backend.core.create_app import app, celery
from backend.redis.notification_worker import process_scheduled_reminders


def start_flask():
    app.run(host="0.0.0.0", port=8000)


def start_celery_worker():
    celery.worker_main(['worker', '--loglevel=info', '--pool=solo'])


def run_scheduled_tasks():
    while True:
        process_scheduled_reminders.delay()
        time.sleep(60)


if __name__ == "__main__":
    flask_thread = threading.Thread(target=start_flask)
    celery_thread = threading.Thread(target=start_celery_worker)
    scheduler_thread = threading.Thread(target=run_scheduled_tasks)

    flask_thread.start()
    celery_thread.start()
    scheduler_thread.start()

    flask_thread.join()
    celery_thread.join()
    scheduler_thread.join()
