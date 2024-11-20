from typing import List, Optional, Dict, Tuple
from flask import jsonify, Response
from sqlalchemy.exc import SQLAlchemyError
from backend.models.event import Event
from backend.models.user import User
from backend.models.event_users import EventUsers


class EventStore:
    @staticmethod
    def create_event(new_event: Dict) -> Tuple[Response, int]:
        try:
            event = Event(**new_event)
            event.save()
            return jsonify({"message": "Event created successfully"}), 201
        except SQLAlchemyError as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_event(event: Dict) -> Tuple[Response, int]:
        try:
            existing_event = Event.find_by(id=event.get('id'))
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
        event = EventStore.get_event_by_id(event_id)
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




