from backend.models.event_users import EventUsers


class EventUsersStore:
    @staticmethod
    def is_worker_assigned(event_id: int, worker_id: str) -> bool:
        """
        Checks if a worker is already assigned to an event.
        """
        return bool(EventUsers.query.filter_by(event_id=event_id, worker_id=worker_id).first())

    @staticmethod
    def add_worker_to_event(event_id: int, worker_id: str) -> None:
        """
        Assigns a worker to an event.
        """
        try:
            event_user = EventUsers(event_id=event_id, worker_id=worker_id) # TODO add job
            event_user.save()
        except Exception as e:
            raise e

    @staticmethod
    def get_workers_by_event(event_id: int):
        """
        Fetches all workers assigned to an event.
        """
        try:
            workers = EventUsers.query.filter_by(event_id=event_id).all()
            return [{"worker_id": worker.worker_id} for worker in workers]
        except Exception as e:
            raise e

