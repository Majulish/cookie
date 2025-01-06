from backend.models.event_users import EventUsers
from backend.models.event_job import EventJob


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
    def add_worker_to_event(event_id: int, worker_id: int, job_id: int) -> None:
        """
        Assigns a worker to a specific job in an event.
        """
        try:
            event_user = EventUsers(event_id=event_id, worker_id=worker_id, job_id=job_id)
            event_user.save_to_db()
        except Exception as e:
            raise Exception(f"Failed to add worker to event: {e}")

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
    def get_worker_job_by_event(event_id: int, worker_id: int) -> dict | None:
        """
        Fetches the job assigned to a worker for a specific event.
        """
        try:
            worker_job = EventUsers.get_worker_job(event_id=event_id, worker_id=worker_id)
            if worker_job:
                job = EventJob.query.get(worker_job["job_id"])
                return {
                    "worker_id": worker_job["worker_id"],
                    "job_id": worker_job["job_id"],
                    "job_title": job.job_title,
                }
        except Exception as e:
            raise Exception(f"Failed to retrieve worker's job: {e}")

