from flask import request, jsonify, Blueprint, redirect, Response
from flask_jwt_extended import jwt_required, get_jwt
from pydantic import ValidationError
from typing import Tuple, Any
from datetime import datetime

from werkzeug import Response

from backend.models.event import Event
from backend.models.roles import Permission, Role, has_permission
from backend.models.schemas import UpdateEvent, FeedResponseSchema, MyEventsResponseSchema
from backend.stores import EventStore
from backend.stores import UserStore

event_blueprint = Blueprint('events', __name__)
JOB_TITLES = ["cook", "cashier", "waiter"]


@event_blueprint.route("/create_event", methods=["POST"])
@jwt_required()
def create_event():
    jwt_data = get_jwt()
    if not jwt_data or 'username' not in jwt_data:
        return redirect('/sign_in')
    username = jwt_data["username"]
    user = UserStore.find_user("username", username)

    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403

    data = request.get_json()
    try:
        name = data.get("name")
        description = data.get("description", "")
        location = data.get("location", "")

        start_datetime = data.get("start_datetime")
        end_datetime = data.get("end_datetime")

        try:
            start_datetime = datetime.fromisoformat(start_datetime)
            end_datetime = datetime.fromisoformat(end_datetime)
        except ValueError:
            return jsonify({"error": "Invalid date format. Use ISO format (e.g., 2024-11-30T10:00:00)"}), 400

        jobs_data = data.get("jobs", {})
        if not isinstance(jobs_data, dict):
            return jsonify({"error": "Invalid jobs format"}), 400

        event_data = {
            "name": name,
            "description": description,
            "location": location,
            "recruiter": username,
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
            "jobs": jobs_data,
        }

        event = EventStore.create_event(event_data)

        return jsonify({"message": "Event created successfully", "event_id": event.id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@event_blueprint.route('/<int:event_id>', methods=['GET'])
@jwt_required()
def get_event(event_id: int) -> Tuple[Response, int]:
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found."}), 404

    workers = [worker.id for worker in event.workers]
    return jsonify({
        "id": event.id,
        "name": event.name,
        "description": event.description,
        "location": event.location,
        "start_datetime": event.start_datetime.isoformat(),
        "end_datetime": event.end_datetime.isoformat(),
        "status": event.status.value,
        "advertised": event.advertised,
        "workers": workers,
        "jobs": [{"job_id": job.id, "openings": job.openings} for job in event.jobs]
    }), 200


@event_blueprint.route("/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id: int) -> Response | tuple[Response, int]:
    jwt_data = get_jwt()
    if not jwt_data or 'username' not in jwt_data:
        return redirect('/sign_in')
    username = jwt_data["username"]
    user = UserStore.find_user("username", username)

    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403

    try:
        data = request.get_json()
        event_data = UpdateEvent(**data)
        result = EventStore.update_event(event_data.model_dump())
        return result
    except (ValidationError, ValueError) as e:
        return jsonify({"error": str(e)}), 400


@event_blueprint.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id: int) -> Tuple[Response, int]:
    jwt_data = get_jwt()
    if not jwt_data or 'username' not in jwt_data:
        return redirect('/sign_in')
    username = jwt_data["username"]
    user = UserStore.find_user("username", username)

    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403

    result = EventStore.delete_event(event_id)
    return result


@event_blueprint.route('/<int:event_id>/workers', methods=['POST'])
@jwt_required()
def add_worker_to_event(event_id: int) -> Response | tuple[Response, int]:
    jwt_data = get_jwt()
    if not jwt_data or 'username' not in jwt_data:
        return redirect('/sign_in')
    username = jwt_data["username"]
    user = UserStore.find_user("username", username)

    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403

    try:
        data = request.get_json()
        worker_id = data.get('worker_id')

        if not worker_id:
            return jsonify({"error": "Worker ID is required."}), 400

        event = Event.query.get(event_id)
        if not event:
            return jsonify({"error": "Event not found."}), 404

        event.add_worker(user.id)
        return jsonify({"message": "Worker added to event successfully."}), 200

    except ValidationError as e:
        return jsonify({"error": str(e)}), 400


@event_blueprint.route("/<int:event_id>/apply", methods=["POST"])
@jwt_required()
def apply_to_event() -> Response | tuple[Response, int] | Any:
    jwt_data = get_jwt()
    if not jwt_data or 'username' not in jwt_data:
        return redirect('/sign_in')
    username = jwt_data["username"]
    event_id = jwt_data["event_id"]

    user = UserStore.find_user("username", username)

    if not has_permission(user.role, Permission.APPLY_FOR_JOBS):
        return jsonify({"error": "Unauthorized. Only workers can apply to events."}), 403

    try:
        data = request.get_json()
        job_title = data.get("job_title")
        if not job_title:
            return jsonify({"error": "Job title is required"}), 400

        result = EventStore.apply_to_event(event_id=event_id, worker_id=user.id, job_title=job_title)
        return result

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@event_blueprint.route('/feed', methods=['GET'])
@jwt_required()
def get_feed():
    jwt_data = get_jwt()
    if not jwt_data or 'username' not in jwt_data:
        return redirect('/sign_in')
    username = jwt_data["username"]
    user = UserStore.find_user("username", username)

    if not user or user.role != Role.WORKER:
        return jsonify({"error": "Unauthorized. Only workers can access this endpoint."}), 403

    filters = request.args.to_dict()
    events = EventStore.get_available_events_for_worker(worker_id=user.personal_id, filters=filters)

    transformed_events = [
        {
            **event,
            "start_datetime": event["start_datetime"].isoformat(),
            "end_datetime": event["end_datetime"].isoformat()
        }
        for event in events
    ]

    response = FeedResponseSchema(events=transformed_events)
    return jsonify(response.dict()), 200


@event_blueprint.route('/my_events', methods=['GET'])
@jwt_required()
def my_events():
    jwt_data = get_jwt()
    if not jwt_data or 'username' not in jwt_data:
        return redirect('/sign_in')
    username = jwt_data["username"]
    user = UserStore.find_user("username", username)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if has_permission(user.role, Permission.MANAGE_APPLICATIONS):
        events = EventStore.get_events_by_recruiter(recruiter_username=username)
    elif has_permission(user.role, Permission.ASSIGN_WORKERS):
        events = EventStore.get_all_events()
    elif has_permission(user.role, Permission.APPLY_FOR_JOBS):
        events = EventStore.get_events_for_worker(worker_id=user.personal_id)
    else:
        return jsonify({"error": "Unauthorized"}), 403

    transformed_events = [
        {
            **event,
            "start_datetime": event["start_datetime"].isoformat(),
            "end_datetime": event["end_datetime"].isoformat()
        }
        for event in events
    ]

    response = MyEventsResponseSchema(events=transformed_events)
    return jsonify(response.dict()), 200


