import threading
import time
from backend.core.celery_app import app, celery
from backend.redis.notification_worker import process_scheduled_reminders
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def start_flask():
    logger.info("Starting Flask server")
    app.run(host="0.0.0.0", port=8000)


def start_celery_worker():
    logger.info("Starting Celery worker")
    celery.worker_main(['worker', '--loglevel=info', '--pool=solo'])


def run_scheduled_tasks():
    logger.info("Starting scheduled tasks runner")
    while True:
        try:
            logger.info("Running scheduled tasks")
            task = process_scheduled_reminders.delay()
            logger.info(f"Scheduled task execution queued with ID: {task.id}")
        except Exception as e:
            logger.error("Error in scheduled tasks")
            logger.exception(e)

        # Wait for 30 seconds before next run
        logger.info("Waiting 30 seconds until next check...")
        time.sleep(30)


if __name__ == "__main__":
    # Clear existing reminders on startup (optional, for troubleshooting)
    try:
        from backend.redis.redis_client import redis_client

        redis_client.delete("event_reminders")
        logger.info("Cleared existing reminders from Redis")
    except Exception as e:
        logger.error("Error clearing reminders")
        logger.exception(e)

    flask_thread = threading.Thread(target=start_flask)
    celery_thread = threading.Thread(target=start_celery_worker)
    scheduler_thread = threading.Thread(target=run_scheduled_tasks)

    logger.info("Starting all threads")
    flask_thread.start()
    celery_thread.start()
    scheduler_thread.start()

    flask_thread.join()
    celery_thread.join()
    scheduler_thread.join()