from typing import List, Optional, Dict, Tuple
from flask import jsonify, Response
from sqlalchemy.exc import SQLAlchemyError
from backend.models.event import Event
from backend.models.user import User
from backend.models.event_users import EventUsers
from backend.models.event_job import EventJob


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
        # Fetch the event
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
    def get_event_by(filter) -> Optional[Event]:
        return Event.query.filter_by(filter).first()
