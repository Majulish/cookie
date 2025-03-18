import datetime
from typing import Optional, Dict, Tuple, List
from flask import jsonify, Response
from sqlalchemy.exc import SQLAlchemyError

from backend.models.reviews import Review
from backend.models.user import User
from backend.models.event import Event
from backend.models.event_users import EventUsers, WorkerStatus
from backend.models.event_job import EventJob
from backend.models.roles import Role
from backend.stores import UserStore
from backend.stores.event_users_store import EventUsersStore
from backend.stores.notification_store import NotificationStore


class EventStore:
    @staticmethod
    def create_event(data: Dict) -> Event:
        try:
            # Create the event using the model
            event = Event.create_event(
                name=data["name"],
                description=data["description"],
                address=data["address"],
                city=data["city"],
                start_datetime=data["start_datetime"],
                end_datetime=data["end_datetime"],
                recruiter=data["recruiter"],
                company_id=data["company_id"]
            )

            # Add associated jobs
            for job_title, slots in data["jobs"].items():
                EventJob.create_event_job(event_id=event.id, job_title=job_title, slots=slots)
            return event

        except Exception as e:
            raise e

    @staticmethod
    def get_available_events_for_worker(worker_id: int, filters: Dict) -> List[Dict]:
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
            return {"error": str(e)}, 500

    @staticmethod
    def delete_event(event_id: int) -> Tuple[Response, int]:
        return Event.delete(event_id)

    @staticmethod
    def get_workers_by_event(event_id: int) -> list[dict]:
        """
        Checks if event exists, then calls the model method to fetch worker data.
        """
        event = Event.find_by("id", event_id)
        if not event:
            # If the event doesn't exist, return an empty list or handle differently
            return []

        return EventUsers.get_workers_detailed(event_id)

    @staticmethod
    def apply_to_event(event_id: int, worker_id: int, job_title: str):
        """
        Worker applies => set status = PENDING. No decrement of 'openings'.
        """
        try:
            event = Event.find_by("id", event_id)
            if not event:
                return jsonify({"error": "Event not found"}), 404

            worker = UserStore.find_user("id", worker_id)
            if not worker:
                return jsonify({"error": "Worker not found"}), 404

            job = EventJob.query.filter_by(event_id=event_id, job_title=job_title).first()
            if not job:
                return jsonify({"error": f"Job '{job_title}' not found in this event"}), 404

            # Worker can apply only if they're not already assigned in ANY status
            if EventUsersStore.is_worker_assigned(event_id, worker_id):
                return jsonify({"message": "You already applied or are assigned to this event"}), 200

            # Just mark them as PENDING in the relationship
            EventUsersStore.assign_worker(event_id, worker_id, job.id, WorkerStatus.PENDING)

            # Notify the HR manager
            hr_user = User.find_by({"company_id": worker.company_id, "role": Role.HR_MANAGER})
            if hr_user:
                full_name = f"{worker.first_name} {worker.family_name}"
                city = worker.city if worker.city else "Unknown city"
                age = datetime.datetime.now().year - datetime.datetime.strptime(worker.birthdate, "%d/%m/%Y").year

                message = f"{full_name}, from {city}, age {age}, requests to join {event.name}."
                NotificationStore.create_notification(hr_user.id, message, event_id=event_id)

            return jsonify({"message": "Successfully applied (pending)"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def assign_worker(event_id: int, worker_id: int, job_title: str, worker_status: WorkerStatus):
        try:
            event = Event.find_by("id", event_id)
            if not event:
                return jsonify({"error": "Event not found"}), 404

            worker = UserStore.find_user("id", worker_id)
            if not worker:
                return jsonify({"error": "Worker not found"}), 404

            if worker.role != Role.WORKER:
                return jsonify({"error": "Only users with role WORKER can be approved for worker positions."}), 400

            job = EventJob.query.filter_by(event_id=event_id, job_title=job_title).first()
            if not job:
                return jsonify({"error": f"Job '{job_title}' not found in this event"}), 404

            # Update or create the worker-event relation with proper handling of openings.
            EventUsersStore.assign_worker(event_id, worker_id, job.id, worker_status)

            # Send worker a notification
            if worker_status == WorkerStatus.APPROVED:
                note_msg = f"You have been accepted for event '{event.name}'."
            elif worker_status == WorkerStatus.BACKUP:
                note_msg = f"You have been assigned as backup for event '{event.name}'."
            else:
                note_msg = f"Your status for event '{event.name}' is now {worker_status.name}."

            NotificationStore.create_notification(worker.id, note_msg)

            return jsonify({"message": f"Worker status set to {worker_status.name}"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

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
        Retrieves a list of events the worker is signed up for, including their job and status.
        """
        try:
            events = Event.get_events_by_worker(worker_id)  # Fetch worker's events
            event_list = []

            for event, status, job_title in events:
                event_dict = event.to_dict()
                event_dict["job_title"] = job_title
                event_dict["worker_status"] = status.value if isinstance(status, WorkerStatus) else status
                event_list.append(event_dict)

            return event_list
        except Exception as e:
            raise e


    @staticmethod
    def rate_worker(event_id: int, worker_id: int, rating: float) -> tuple:
        """
        Updates the rating of a worker.
        Returns a tuple (response message, status code).
        """
        try:
            worker = User.find_by({"id": worker_id})
            if not worker:
                return jsonify({"error": "Worker not found"}), 404

            worker_event = EventUsers.get_worker_job(event_id, worker_id)
            if not worker_event:
                return jsonify({"error": "Worker is not assigned to this event"}), 404

            # Update rating if provided
            if rating:
                if not (0 <= rating <= 5):
                    return jsonify({"error": "Rating must be between 0 and 5"}), 400
                worker.update_rating(rating)

            return "Rating updated successfully", 200
        except Exception as e:
            return f"Failed to update rating: {str(e)}", 500

    @staticmethod
    def review_worker(event_id: int, worker_id: int, review: str, commenter_id: int) -> tuple:
        """
        Adds a review for a worker.
        Returns a tuple (response message, status code).
        """
        try:
            worker = User.find_by({"id": worker_id})
            if not worker:
                return jsonify({"error": "Worker not found"}), 404

            worker_event = EventUsers.get_worker_job(event_id, worker_id)
            if not worker_event:
                return jsonify({"error": "Worker is not assigned to this event"}), 404

            Review.add_review(worker_id, commenter_id, review, event_id)
            return "Review added successfully", 200
        except Exception as e:
            return f"Failed to add review: {str(e)}", 500
