from typing import Optional, Dict, Tuple, List
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
                start_time=data["start_datetime"],
                end_time=data["end_datetime"],
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
            # Delegate database queries to the Event model
            events = Event.get_future_events_excluding_signed(worker_id, filters)

            # Convert events to a dictionary for API response
            return [event.to_dict() for event in events]

        except Exception as e:
            raise e

    @staticmethod
    def update_event(event: Dict) -> Tuple[Response, int]:
        try:
            existing_event = Event.find_by(id=event.get("id"))
            if not existing_event:
                return jsonify({"error": "Event not found"}), 404

            for key, value in event.items():
                if hasattr(existing_event, key):
                    setattr(existing_event, key, value)
            existing_event.save()
            return jsonify({"message": "Event updated successfully"}), 200
        except SQLAlchemyError as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_event(event_id: int) -> Tuple[Response, int]:
        try:
            event = Event.find_by(id=event_id)
            if event:
                event.delete()
                return jsonify({"message": "Event deleted successfully"}), 200
            return jsonify({"error": "Event not found"}), 404
        except SQLAlchemyError as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_workers_by_event(event_id: int) -> tuple[Response, int]:
        event = EventStore.get_event_by({"id": event_id})
        if not event:
            return jsonify({"error": "Event not found."}), 404

        workers = (
            User.query
            .join(EventUsers, User.id == EventUsers.user_id)
            .filter(EventUsers.event_id == event_id)
            .all()
        )

        worker_data = [{
            "id": worker.id,
            "name": worker.name,
            "email": worker.email,
            "role": worker.role.value
        } for worker in workers]

        return jsonify(worker_data), 200

    @staticmethod
    def apply_to_event(event_id: int, worker_id: str, job_title: str) -> tuple[Response, int]:
        """
        Handles worker application to an event.
        """
        try:
            event = EventStore.get_event_by({"id": event_id})
            if not event:
                return jsonify({"error": "Event not found"}), 404

            job = EventJob.query.filter_by(event_id=event_id, job_title=job_title).first()
            if not job:
                return jsonify({"error": f"Job '{job_title}' not found in this event"}), 404
            if job.openings <= 0:
                return jsonify({"error": "No openings available for this job"}), 400

            if EventUsersStore.is_worker_assigned(event_id=event_id, worker_id=worker_id):
                return jsonify({"message": "You have already applied for this event"}), 200

            # Assign the worker to the event
            EventUsersStore.add_worker_to_event(event_id=event_id, worker_id=worker_id)

            # Reduce job openings
            job.openings -= 1
            job.save()

            return jsonify({"message": "Successfully applied to the event"}), 201

        except Exception as e:
            raise e

    @staticmethod
    def get_event_by(filter: dict) -> Optional[Event]:
        return Event.query.filter_by(filter).first()

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
