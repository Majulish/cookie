from flask import request, jsonify, Blueprint, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from pydantic import ValidationError
from typing import Tuple
from datetime import datetime

from backend.models import Event, user, event_job, EventStatus
from backend.db import db

event_blueprint = Blueprint('events', __name__)


# Create a new event
@event_blueprint.route('/events', methods=['POST'])
@jwt_required()
def create_event() -> Tuple[Response, int]:
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        location = data.get('location', '')
        start_time = datetime.fromisoformat(data.get('start_time'))
        end_time = datetime.fromisoformat(data.get('end_time'))
        status = EventStatus[data.get('status', 'PLANNED').upper()]
        advertised = data.get('advertised', False)

        event = Event(
            name=name,
            description=description,
            location=location,
            start_time=start_time,
            end_time=end_time,
            status=status,
            advertised=advertised
        )
        event.create_event()
        return jsonify({"message": "Event created successfully."}), 201

    except (ValidationError, ValueError) as e:
        return jsonify({"error": str(e)}), 400


# Retrieve details of a specific event
@event_blueprint.route('/events/<int:event_id>', methods=['GET'])
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


# Update an existing event
@event_blueprint.route('/events/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id: int) -> Tuple[Response, int]:
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found."}), 404

    try:
        data = request.get_json()
        event.name = data.get('name', event.name)
        event.description = data.get('description', event.description)
        event.location = data.get('location', event.location)
        event.start_time = datetime.fromisoformat(data.get('start_time', event.start_time.isoformat()))
        event.end_time = datetime.fromisoformat(data.get('end_time', event.end_time.isoformat()))
        event.status = EventStatus[data.get('status', event.status.name).upper()]
        event.advertised = data.get('advertised', event.advertised)

        event.save_to_db()
        return jsonify({"message": "Event updated successfully."}), 200

    except (ValidationError, ValueError) as e:
        return jsonify({"error": str(e)}), 400


# Delete an event
@event_blueprint.route('/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id: int) -> Tuple[Response, int]:
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found."}), 404

    event.delete()
    return jsonify({"message": "Event deleted successfully."}), 200


# Add a worker to an event
@event_blueprint.route('/events/<int:event_id>/workers', methods=['POST'])
@jwt_required()
def add_worker_to_event(event_id: int) -> Tuple[Response, int]:
    try:
        data = request.get_json()
        worker_id = data.get('worker_id')
        event = Event.query.get(event_id)
        if not event:
            return jsonify({"error": "Event not found."}), 404

        worker = user.query.filter_by(id=worker_id, role='WORKER').first()
        if not worker:
            return jsonify({"error": "Worker not found or not a valid worker."}), 404

        event.add_worker(worker_id)
        return jsonify({"message": "Worker added to event successfully."}), 200

    except ValidationError as e:
        return jsonify({"error": str(e)}), 400


# Add a job to an event
@event_blueprint.route('/events/<int:event_id>/jobs', methods=['POST'])
@jwt_required()
def add_job_to_event(event_id: int) -> Tuple[Response, int]:
    try:
        data = request.get_json()
        job_id = data.get('job_id')
        openings = data.get('openings')
        event = Event.query.get(event_id)
        if not event:
            return jsonify({"error": "Event not found."}), 404

        job = event_job.query.get(job_id)
        if not job:
            return jsonify({"error": "Job not found."}), 404

        event.add_job(job, openings)
        return jsonify({"message": "Job added to event successfully."}), 200

    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
