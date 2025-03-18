import datetime
from flask import jsonify, Response
from typing import Dict, Tuple, Optional

from backend.utils.auth import hash_data
from backend.models.reviews import Review
from backend.models.user import User


class UserStore:
    @staticmethod
    def create_user(data: Dict) -> Tuple[Response, int]:
        try:
            if "password" in data:
                data["password_hash"] = hash_data(data.pop("password"))

            user = User(**data)
            user.save_to_db()
            return jsonify({"message": "User created successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_user(user_id: int, data: Dict) -> Tuple[Response, int]:
        try:
            user = User.find_by({"id": user_id})
            if not user:
                return jsonify({"error": "User not found"}), 404
            user.update_user(data)
            return jsonify({"message": "User updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def user_exists(data):
        fields_to_check = ["username", "email", "personal_id"]
        messages = {
            "username": "Username already exists",
            "email": "Email already exists",
            "personal_id": "Personal ID already exists"
        }

        for field in fields_to_check:
            existing_user = UserStore.find_user(field, getattr(data, field))
            if existing_user:
                return messages[field]

    @staticmethod
    def delete_user(field: str, value: str) -> Tuple[Response, int]:
        try:
            success = User.delete_by(field, value)
            if success:
                return jsonify({"message": "User deleted successfully"}), 200
            return jsonify({"error": "User not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def find_user(field: str, value: str | int) -> Optional[User]:
        return User.find_by({field: value})


    @staticmethod
    def get_worker_profile(worker_id: int):

        try:
            worker = User.find_by({"id": worker_id})
            if not worker:
                return {"error": "Worker not found"}

            # Get worker reviews
            reviews = Review.find_by({"worker_id": worker_id})
            reviews_list = [
                {
                    "reviewer_name": f"{r.commenter.first_name} {r.commenter.family_name}" if r.commenter else "Unknown",
                    "review_text": r.review_text,
                    "timestamp": r.timestamp.isoformat(),
                    "event_id": r.event_id
                } for r in reviews
            ] if reviews else []

        except Exception as e:
            return jsonify({"error": f"Failed to fetch reviews: {str(e)}"}), 500

        # Prepare response data
        profile_data = {
            "full_name": f"{worker.first_name} {worker.family_name}",
            "city": worker.city,
            "phone": worker.phone_number,
            "email": worker.email,
            "age": datetime.datetime.now().year - datetime.datetime.strptime(worker.birthdate, "%d/%m/%Y").year,
            "rating": worker.rating,
            "reviews": reviews_list,
            "company_name": worker.company_name,
            "company_id": worker.company_id,
        }

        return jsonify(profile_data), 200


