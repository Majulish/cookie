from flask import request, jsonify, Blueprint, Response, redirect, app
from flask_jwt_extended import jwt_required, get_jwt
from pydantic import ValidationError
from typing import Tuple

from backend.models.event import Event
from backend.models.event_users import EventUsers
from backend.models.user import User
from backend.models.job import Job
from backend.models.roles import Permission, Role, has_permission
from backend.models.schemas import UpdateEvent
from backend.stores import EventStore
from backend.stores import UserStore

event_blueprint = Blueprint('events', __name__)
JOB_TITLES = ["cook", "cashier", "waiter"]


@event_blueprint.route("/create_event", methods=["POST"])
@jwt_required()
def create_event():
    from backend.app.utils import combine_date_time
    jwt_data = get_jwt()
    if not jwt_data or "role" not in jwt_data:
        return jsonify({"error": "Unauthorized"}), 403

    current_role = jwt_data["role"]
    if not has_permission(current_role, Permission.MANAGE_EVENTS):
        return jsonify({"error": "Permission denied"}), 403

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
    if not jwt_data or "role" not in jwt_data:
        return jsonify({"error": "Unauthorized"}), 403

    current_role = jwt_data["role"]
    if not has_permission(current_role, Permission.MANAGE_EVENTS):
        return jsonify({"error": "Permission denied"}), 403

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
    if not jwt_data or "role" not in jwt_data:
        return jsonify({"error": "Unauthorized"}), 403

    current_role = jwt_data["role"]
    if not has_permission(current_role, Permission.MANAGE_EVENTS):
        return jsonify({"error": "Permission denied"}), 403

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


@event_blueprint.route('/<int:event_id>/apply', methods=['POST'])
@jwt_required()
def add_job_to_event(event_id: int) -> Tuple[Response, int]:
    try:
        data = request.get_json()
        job_id = data.get('job_id')
        job_name = data.get('name')
        openings = data.get('openings')
        event = Event.query
        if not event:
            return jsonify({"error": "Event not found."}), 404

        job_data = Job(id=job_id, name=job_name)
        Job.create_job(job_data)

        add_job_to_event(event_id, job_id, openings)

        return jsonify({"message": "Job added to event successfully."}), 200

    except ValidationError as e:
        return jsonify({"error": str(e)}), 400


@event_blueprint.route('/my_events', methods=['GET'])
@jwt_required(locations=["cookies"])
@jwt_required()
def get_my_events():  # available or waiting-list, registered  or both parameter
    jwt_data = get_jwt()
    if not jwt_data or 'username' not in jwt_data:
        return redirect('/sign_in')
    username = jwt_data["username"]

    user_data = UserStore.find_user_by_username(username)
    if not user_data:
        return jsonify({"error": "User not found"}), 404
    user_id = user_data["personal_id"]
    user_role = user_data["role"]

    if user_role == Role.WORKER.value:  # TODO: here we need to use rbac and check for a permission, not a role
        events = EventUsers.get_events_by_worker(user_id)
    elif user_role in [Role.HR_MANAGER.value, Role.RECRUITER.value, Role.ADMIN.value]:
        events = EventUsers.get_events_by_manager(user_id)
    else:
        return jsonify({"error": "User role is not authorized to view events"}), 403

    if not events:
        return jsonify({"message": "No events found for the user"}), 204

    event_data = [event.to_dict() for event in events]

    return jsonify({"events": event_data}), 200
