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
    def add_worker_to_event(event_id: int, worker_id: int, job_title: str, status: WorkerStatus) -> None:
        """
        Adds a worker to a specific job in an event with a status.
        """
        try:
            # Resolve EventJob
            event_job = EventJob.query.filter_by(event_id=event_id, job_title=job_title).first()
            if not event_job:
                raise ValueError(f"Job '{job_title}' not found for this event.")
            if event_job.openings <= 0:
                raise ValueError(f"Job '{job_title}' doesn't have any openings left.")

            existing_entry = EventUsers.query.filter_by(event_id=event_id, worker_id=worker_id,
                                                        job_id=event_job.id).first()
            if existing_entry:
                raise ValueError("Worker is already assigned to this job in the event.")

            event_user = EventUsers(
                event_id=event_id,
                worker_id=worker_id,
                job_id=event_job.id,
                status=status
            )
            event_user.save_to_db()
            event_job.reduce_openings()
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
