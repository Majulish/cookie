# event_routes.py
from flask import request, jsonify, Blueprint
from pydantic import ValidationError
from datetime import datetime
from backend.app.decorators import load_user
from backend.models.roles import Permission, Role, has_permission
from backend.openai_utils import generate_event_description
from backend.models.schemas import UpdateEvent
from backend.stores import EventStore, EventUsersStore
from backend.models.event import Event

event_blueprint = Blueprint('events', __name__)
JOB_TITLES = ["cook", "cashier", "waiter"]


@event_blueprint.route("/generate_description", methods=["POST"])
def generate_description():
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415
    data = request.get_json()
    if not data or "prompt" not in data:
        return jsonify({"error": "'prompt' is required"}), 400
    try:
        prompt = data["prompt"]
        description = generate_event_description(f"Generate an event/job description:\n\n{prompt}")
        return jsonify({"description": description}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@event_blueprint.route("/create_event", methods=["POST"])
@load_user
def create_event(user):
    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403
    try:
        data = request.get_json()
        start = data.get("start_datetime")
        end = data.get("end_datetime")
        try:
            start = datetime.fromisoformat(start)
            end = datetime.fromisoformat(end)
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400
        event_data = {
            "name": data.get("name"),
            "description": data.get("description", ""),
            "location": data.get("location", ""),
            "recruiter": user.username,
            "start_datetime": start,
            "end_datetime": end,
            "jobs": data.get("jobs", {})
        }
        event = EventStore.create_event(event_data)
        return jsonify({"message": "Event created", "event_id": event.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@event_blueprint.route('/<int:event_id>', methods=['GET'])
@load_user
def get_event(user, event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    workers = [w.id for w in event.workers]
    return jsonify({
        "id": event.id,
        "name": event.name,
        "description": event.description,
        "location": event.location,
        "start_datetime": event.start_datetime.isoformat(),
        "end_datetime": event.end_datetime.isoformat(),
        "status": event.status,
        "workers": workers,
        "jobs": [{"job_id": j.id, "openings": j.openings} for j in event.jobs]
    }), 200


@event_blueprint.route("/<int:event_id>", methods=["PUT"])
@load_user
def update_event(user, event_id):
    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403
    try:
        data = request.get_json()
        updated_data = UpdateEvent(**data)
        result = EventStore.update_event(event_id, updated_data.model_dump())
        return result
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400


@event_blueprint.route('/<int:event_id>', methods=['DELETE'])
@load_user
def delete_event(user, event_id):
    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403
    return EventStore.delete_event(event_id)


@event_blueprint.route('/<int:event_id>/workers', methods=['POST'])
@load_user
def add_worker_to_event(user, event_id):
    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403
    data = request.get_json()
    worker_id = data.get('worker_id')
    if not worker_id:
        return jsonify({"error": "Worker ID is required"}), 400
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    event.add_worker(worker_id)  # Should pass worker_id, not user.id
    return jsonify({"message": "Worker added"}), 200


@event_blueprint.route("/<int:event_id>/apply", methods=["POST"])
@load_user
def apply_to_event(user, event_id):
    if not has_permission(user.role, Permission.APPLY_FOR_JOBS):
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    job_title = data.get("job_title")
    if not job_title:
        return jsonify({"error": "Job title is required"}), 400
    return EventStore.apply_to_event(event_id, user.id, job_title)


@event_blueprint.route('/feed', methods=['GET'])
@load_user
def get_feed(user):
    if user.role != Role.WORKER:
        return jsonify({"error": "Unauthorized"}), 403
    filters = request.args.to_dict()
    events = EventStore.get_available_events_for_worker(user.personal_id, filters)
    return jsonify(events), 200


@event_blueprint.route('/my_events', methods=['GET'])
@load_user
def my_events(user):
    if has_permission(user.role, Permission.MANAGE_APPLICATIONS):
        events = EventStore.get_events_by_recruiter(user.username)
    elif has_permission(user.role, Permission.ASSIGN_WORKERS):
        events = EventStore.get_all_events()
    elif has_permission(user.role, Permission.APPLY_FOR_JOBS):
        events = EventStore.get_events_for_worker(user.id)
    else:
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify(events), 200


@event_blueprint.route('/<int:event_id>/my_job', methods=['GET'])
@load_user
def get_my_job(user, event_id):
    if user.role != Role.WORKER:
        return jsonify({"error": "Unauthorized"}), 403
    try:
        job = EventUsersStore.get_worker_job_by_event(event_id, user.personal_id)
        if not job:
            return jsonify({"message": "No job assigned"}), 404
        return jsonify(job), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
