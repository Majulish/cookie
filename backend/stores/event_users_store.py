from backend.models.event_job import EventJob
from backend.models.event_users import EventUsers
from backend.models.event_users import WorkerStatus


class EventUsersStore:
    @staticmethod
    def is_worker_assigned(event_id: int, worker_id: int) -> bool:
        """
        Checks if a worker is already assigned to an event for any job.
        """
        try:
            return EventUsers.query.filter_by(event_id=event_id, worker_id=worker_id).first() is not None
        except Exception as e:
            print(f"Error is: {e}")

    @staticmethod
    def assign_worker(event_id: int, worker_id: int, job_id: int, status: WorkerStatus):
        """
        Store-level method simply delegates to the EventUsers model.
        """
        return EventUsers.assign_worker(event_id, worker_id, job_id, status)

    @staticmethod
    def get_workers_by_event(event_id: int):
        """
        Fetches all workers assigned to an event along with their assigned jobs.
        """
        try:
            return EventUsers.get_workers_by_event(event_id)
        except Exception as e:
            raise Exception(f"Failed to get workers by event: {e}")

    @staticmethod
    def update_event_users(event_id: int, worker_id: int, update_data: dict):
        if event_users := EventUsers.query.filter_by(event_id=event_id, worker_id=worker_id).first():
            event_users.update(update_data)
            return event_users
        return None
