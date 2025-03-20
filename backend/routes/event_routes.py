from flask import request, jsonify, Blueprint
from pydantic import ValidationError
from datetime import datetime

from backend.utils.decorators import load_user, permission_required
from backend.models.event_users import WorkerStatus
from backend.models.roles import Permission, Role, has_permission
from backend.utils.openai_utils import generate_event_description
from backend.models.schemas import UpdateEvent
from backend.stores import EventStore
from backend.models.event import Event

event_blueprint = Blueprint('events', __name__)
JOB_TITLES = ["cook", "cashier", "waiter", "constructor", "cleaner", "barman", "barista"]


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
            "city": data.get("city", "Unknown city"),
            "address": data.get("address", "Unknown address"),
            "recruiter": user.username,
            "start_datetime": start,
            "end_datetime": end,
            "jobs": data.get("jobs", {}),
            "company_id": data.get("company_id", "0")
        }
        event = EventStore.create_event(event_data)
        return jsonify({"message": "Event created", "event_id": event.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@event_blueprint.route('/<int:event_id>', methods=['GET'])
@load_user
@permission_required(Permission.MANAGE_EVENTS)
def get_event(user, event_id):
    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    workers = EventStore.get_workers_by_event(event_id)

    return jsonify({
        "workers": workers,
        **event.to_dict()
    }), 200


@event_blueprint.route("/<int:event_id>", methods=["PUT"])
@load_user
def update_event(user, event_id):
    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403

    try:
        data = request.get_json()
        start_str = data.get("start_datetime")
        end_str = data.get("end_datetime")

        try:
            data["start_datetime"] = datetime.fromisoformat(start_str)
            data["end_datetime"] = datetime.fromisoformat(end_str)
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400

        updated_data = UpdateEvent(**data)
        result = EventStore.update_event(event_id, data)
        return result
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400


@event_blueprint.route('/<int:event_id>', methods=['DELETE'])
@load_user
def delete_event(user, event_id):
    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403
    return EventStore.delete_event(event_id)


@event_blueprint.route('/assign_worker/', methods=['POST'])
@load_user
def assign_worker_route(user):
    if not has_permission(user.role, Permission.MANAGE_EVENTS):
        return jsonify({"error": f"Unauthorized. {user.role} can't manage events"}), 403

    data = request.get_json()
    job_title = data.get("job_title")
    worker_id = data.get("worker_id")
    event_id = data.get("event_id")
    status = data.get("status")

    if not all([job_title, worker_id, event_id, status]):
        return jsonify({"error": "Missing required fields (job_title, worker_id, event_id, status)."}), 400

    try:
        worker_status = WorkerStatus(status.upper())
    except ValueError:
        return jsonify({"error": f"Invalid status '{status}'. Valid: approved, backup, done, pending."}), 400

    return EventStore.assign_worker(event_id, worker_id, job_title, worker_status)


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
    events = EventStore.get_available_events_for_worker(user.id, filters)
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


@event_blueprint.route("/<int:event_id>/feedback_worker", methods=["POST"])
@load_user
def feedback_worker(user, event_id):
    if not has_permission(user.role, Permission.RATE_WORKERS):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    worker_id = data.get("worker_id")
    rating = data.get("rating")
    review = data.get("review")

    if not worker_id:
        return jsonify({"error": "Worker ID is required"}), 400
    if not rating and not review:
        return jsonify({"error": "Either rating or review is required"}), 400

    if worker_in_event := EventStore.ensure_worker_in_event(event_id, worker_id):
        return worker_in_event

    rating_message, rating_status = EventStore.rate_worker(worker_id, rating) \
        if rating else ("", 0)
    review_message, review_status = EventStore.review_worker(event_id, worker_id, review, user.id)\
        if review else ("", 0)

    return jsonify({"messages": f"{rating_message}\n{review_message}"}), max(rating_status, review_status)












