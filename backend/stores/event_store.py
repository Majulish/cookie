from typing import Optional, Dict, Tuple, List, Any
from flask import jsonify, Response
from sqlalchemy.exc import SQLAlchemyError

from backend.models.event import Event
from backend.models.user import User
from backend.models.event_users import EventUsers
from backend.models.event_job import EventJob
from backend.stores.event_users_store import EventUsersStore


class EventStore:
    @staticmethod
    def create_event(data: Dict) -> Event:
        try:
            # Create the event using the model
            event = Event.create_event(
                name=data["name"],
                description=data["description"],
                location=data["location"],
                start_datetime=data["start_datetime"],
                end_datetime=data["end_datetime"],
                recruiter=data["recruiter"],
            )

            # Add associated jobs
            for job_title, slots in data["jobs"].items():
                EventJob.create_event_job(event_id=event.id, job_title=job_title, slots=slots)

            return event

        except Exception as e:
            raise e

    @staticmethod
    def get_available_events_for_worker(worker_id: str, filters: Dict) -> List[Dict]:
        """
        Returns a list of future events that the worker can apply to, excluding events they're already signed up for.
        """
        try:
            events = Event.get_future_events_excluding_signed(worker_id, filters)
            return [event.to_dict() for event in events]

        except Exception as e:
            raise e

    @staticmethod
    def update_event(event_id: int, new_data: Dict) -> Tuple:
        existing_event = Event.find_by("id", event_id)
        if not existing_event:
            return jsonify({"error": "Event not found"}), 404
        try:
            existing_event.update_event(new_data)
            return jsonify({"message": "Event updated successfully"}), 200
        except SQLAlchemyError as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_event(event_id: int) -> Tuple[Response, int]:
        return Event.delete(event_id)


    @staticmethod
    def get_workers_by_event(event_id: int) -> None | list[dict[str, Any]]:
        event = EventStore.get_event_by(**{"id": event_id})
        if not event:
            return None

        workers = (
            User.query
            .join(EventUsers, User.id == EventUsers.worker_id)
            .filter(EventUsers.event_id == event_id)
            .all()
        )

        worker_data = [{
            "id": worker.id,
            "name": f"{worker.first_name} + {worker.last_name}",
            "email": worker.email,
            "role": worker.role.value
        } for worker in workers]

        return worker_data

    @staticmethod
    def get_event_job_by(**filters):
        """Returns a list of event jobs filtered by the given kwargs."""
        return EventJob.query.filter_by(**filters).all()

    @staticmethod
    def apply_to_event(event_id: int, worker_id: int, job_title: str) -> tuple[Response, int]:
        """
        Handles worker application to an event for a specific job.
        """
        try:
            filter = {"id": event_id}
            event = EventStore.get_event_by(**filter)
            if not event:
                return jsonify({"error": "Event not found"}), 404

            job = EventJob.query.filter_by(event_id=event_id, job_title=job_title).first()
            if not job:
                return jsonify({"error": f"Job '{job_title}' not found in this event"}), 404
            if job.openings <= 0:
                return jsonify({"error": "No openings available for this job"}), 400

            if EventUsersStore.is_worker_assigned(event_id=event_id, worker_id=worker_id):
                return jsonify({"message": "You have already applied for this job in the event"}), 200

            EventUsersStore.add_worker_to_event(event_id=event_id, worker_id=worker_id, job_id=job.id)

            job.openings -= 1
            job.save_to_db()

            return jsonify({"message": "Successfully applied to the event"}), 201

        except Exception as e:
            raise e

    @staticmethod
    def get_event_by(**filter) -> Optional[Event]:
        return Event.query.filter_by(**filter).first()

    @staticmethod
    def get_all_events() -> List[Dict]:
        """
        Returns a list of all events.
        """
        try:
            events = Event.query.all()
            return [event.to_dict() for event in events]
        except Exception as e:
            raise e

    @staticmethod
    def get_events_by_recruiter(recruiter_username: str) -> List[Dict]:
        """
        Returns a list of events created by the recruiter.
        """
        try:
            events = Event.query.filter_by(recruiter=recruiter_username).all()
            return [event.to_dict() for event in events]
        except Exception as e:
            raise e

    @staticmethod
    def get_events_for_worker(worker_id: int) -> List[Dict]:
        """
        Retrieves a list of events the worker is signed up for, using model capabilities.
        """
        try:
            # Use the model's capability to fetch events
            events = Event.get_events_by_worker(worker_id)

            # Convert events to dictionary format
            return [event.to_dict() for event in events]
        except Exception as e:
            raise e
