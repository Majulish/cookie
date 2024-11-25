import unittest
import datetime
from backend.db import db
from backend.main import create_app
from backend.models.event import Event
from backend.models.roles import Role
from backend.models.user import User


class TestEventBasicActions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        cls.client = cls.app.test_client()
        db.create_all()

        # Add a recruiter user
        cls.recruiter = User(
            username="recruiter",
            email="recruiter@example.com",
            password_hash="hashed_password",
            role=Role.RECRUITER,
        )
        db.session.add(cls.recruiter)
        db.session.commit()

    @classmethod
    def tearDownClass(cls):
        db.session.remove()
        db.drop_all()
        cls.app_context.pop()

    def test_create_event(self):
        response = self.client.post(
            "/create_event",
            json={
                "name": "Test Event",
                "description": "A simple test event",
                "location": "Test Location",
                "start_datetime": (datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=1)).isoformat(),
                "end_datetime": (datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=2)).isoformat(),
                "jobs": {"Cook": 3, "Waiter": 2},
            },
            headers={"Authorization": "Bearer mock_recruiter_token"},
        )
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("event_id", data)

    def test_get_event(self):
        # Create an event first
        event = Event(
            name="Test Event",
            description="Retrieve test event",
            location="Test Location",
            start_time=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=1),
            end_time=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=2),
            recruiter="recruiter",
        )
        db.session.add(event)
        db.session.commit()

        response = self.client.get(f"/{event.id}", headers={"Authorization": "Bearer mock_recruiter_token"})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["name"], "Test Event")

    def test_update_event(self):
        # Create an event to update
        event = Event(
            name="Old Event",
            description="Event to update",
            location="Old Location",
            start_time=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=1),
            end_time=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=2),
            recruiter="recruiter",
        )
        db.session.add(event)
        db.session.commit()

        response = self.client.put(
            f"/{event.id}",
            json={
                "name": "Updated Event",
                "description": "Updated description",
                "location": "New Location",
                "start_date": event.start_time.isoformat(),
                "end_date": event.end_time.isoformat(),
            },
            headers={"Authorization": "Bearer mock_recruiter_token"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["message"], "Event updated successfully")

    def test_delete_event(self):
        # Create an event to delete
        event = Event(
            name="Delete Event",
            description="Event to delete",
            location="Delete Location",
            start_time=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=1),
            end_time=datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=2),
            recruiter="recruiter",
        )
        db.session.add(event)
        db.session.commit()

        response = self.client.delete(f"/{event.id}", headers={"Authorization": "Bearer mock_recruiter_token"})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["message"], "Event deleted successfully.")


if __name__ == "__main__":
    unittest.main()
