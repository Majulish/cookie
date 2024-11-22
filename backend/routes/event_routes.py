from flask import request, jsonify, Blueprint, Response, redirect, app
from flask_jwt_extended import jwt_required, get_jwt
from pydantic import ValidationError
from typing import Tuple, Any

from werkzeug import Response

from backend.models.event import Event
from backend.models.user import User
from backend.models.roles import Permission, Role, has_permission, check_permission
from backend.models.schemas import UpdateEvent
from backend.stores import EventStore
from backend.stores import UserStore
from backend.app.utils import combine_date_time

event_blueprint = Blueprint('events', __name__)
JOB_TITLES = ["cook", "cashier", "waiter"]


@event_blueprint.route("/create_event", methods=["POST"])
@jwt_required()
def create_event():
    jwt_data = get_jwt()
    if (not jwt_data or "role" not in jwt_data or
            not has_permission(jwt_data["role"], Permission.MANAGE_EVENTS)):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    try:
        # Parse and validate event details
        name = data.get("name")
        description = data.get("description", "")
        location = data.get("location", "")

        jwt_data = get_jwt()
        if not jwt_data or 'username' not in jwt_data:
            return redirect('/sign_in')
        recruiter = jwt_data["username"]

        start_date = data.get("start_date")
        start_time = data.get("start_time")
        end_date = data.get("end_date")
        end_time = data.get("end_time")

        if not all([start_date, start_time, end_date, end_time]):
            return jsonify({"error": "Start and end date/time are required"}), 400

        start_datetime = combine_date_time(start_date, start_time)
        end_datetime = combine_date_time(end_date, end_time)

        jobs_data = data.get("jobs", {})
        if not isinstance(jobs_data, dict):
            return jsonify({"error": "Invalid jobs format"}), 400

        event_data = {
            "name": name,
            "description": description,
            "location": location,
            "recruiter": recruiter,
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
        "start_time": event.start_time.isoformat(),
        "end_time": event.end_time.isoformat(),
        "status": event.status.value,
        "advertised": event.advertised,
        "workers": workers,
        "jobs": [{"job_id": job.id, "openings": job.openings} for job in event.jobs]
    }), 200


@event_blueprint.route("/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id: int) -> Tuple[Response, int]:
    jwt_data = get_jwt()
    if (not jwt_data or "role" not in jwt_data or
            not has_permission(jwt_data["role"], Permission.MANAGE_EVENTS)):
        return jsonify({"error": "Unauthorized"}), 403

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
    if (not jwt_data or "role" not in jwt_data or
            not has_permission(jwt_data["role"], Permission.MANAGE_EVENTS)):
        return jsonify({"error": "Unauthorized"}), 403

    result = EventStore.delete_event(event_id)
    return result


@event_blueprint.route('/<int:event_id>/workers', methods=['POST'])
@jwt_required()
def add_worker_to_event(event_id: int) -> Tuple[Response, int]:
    try:
        data = request.get_json()
        worker_id = data.get('worker_id')

        if not worker_id:
            return jsonify({"error": "Worker ID is required."}), 400

        event = Event.query.get(event_id)
        if not event:
            return jsonify({"error": "Event not found."}), 404

        worker = User.find_by_id(worker_id)
        if not worker:
            return jsonify({"error": "Worker not found or not a valid worker."}), 404

        event.add_worker(worker_id)
        return jsonify({"message": "Worker added to event successfully."}), 200

    except ValidationError as e:
        return jsonify({"error": str(e)}), 400


@event_blueprint.route("/<int:event_id>/apply", methods=["POST"])
@jwt_required()
def apply_to_event(event_id: int) -> Response | tuple[Response, int] | Any:
    jwt_data = get_jwt()
    if not jwt_data or 'username' not in jwt_data:
        return redirect('/sign_in')
    username = jwt_data["username"]
    user_role = jwt_data.get("role")

    if not user_role or not has_permission(Role(user_role), Permission.APPLY_FOR_JOBS):
        return jsonify({"error": "Unauthorized. Only workers can apply to events."}), 403

    try:
        worker = UserStore.find_user("username", username)

        data = request.get_json()
        job_title = data.get("job_title")
        if not job_title:
            return jsonify({"error": "Job title is required"}), 400

        result = EventStore.apply_to_event(event_id=event_id, worker_id=worker["personal_id"], job_title=job_title)
        return result

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@event_blueprint.route('/events/available', methods=['GET'])
@jwt_required()
def get_available_events():
    jwt_data = get_jwt()
    if not jwt_data or 'username' not in jwt_data:
        return redirect('/sign_in')

    username = jwt_data["username"]
    permission_check = check_permission(Permission.VIEW_EVENTS)
    if permission_check:
        return permission_check

    user = UserStore.find_user("username", username)
    if not user or user.role != Role.WORKER:
        return jsonify({"error": "Unauthorized. Only workers can access this endpoint."}), 403

    filters = request.args.to_dict()
    events = EventStore.get_available_events_for_worker(worker_id=user.personal_id, filters=filters)
    return jsonify({"events": events}), 200

