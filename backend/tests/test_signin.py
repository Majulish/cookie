import unittest
from werkzeug.security import generate_password_hash

from backend.db import db
from backend.main import create_app
from backend.models.user import User
from backend.models.roles import Role


class TestUserSignIn(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        cls.client = cls.app.test_client()
        db.create_all()

        # Create a test user in the database
        hashed_password = generate_password_hash("password123")
        cls.test_user = User(
            username="testuser",
            email="testuser@example.com",
            password_hash=hashed_password,
            role=Role.WORKER,
            first_name="John",
            family_name="Doe",
            personal_id="123456789",
        )
        db.session.add(cls.test_user)
        db.session.commit()

    @classmethod
    def tearDownClass(cls):
        db.session.remove()
        db.drop_all()
        cls.app_context.pop()

    def test_signin_successful(self):
        # Attempt to sign in with valid credentials
        response = self.client.post("/users/signin", json={
            "username": "testuser",
            "password": "password123",
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("access_token", data, "access_token missing in response")

    def test_signin_invalid_password(self):
        # Attempt to sign in with an invalid password
        response = self.client.post("/users/signin", json={
            "username": "testuser",
            "password": "wrongpassword",
        })
        self.assertEqual(response.status_code, 401)
        data = response.get_json()
        self.assertIn("message", data, "Message missing in response")
        self.assertEqual(data["message"], "Invalid username or password")

    def test_signin_nonexistent_user(self):
        # Attempt to sign in with a nonexistent username
        response = self.client.post("/users/signin", json={
            "username": "nonexistentuser",
            "password": "password123",
        })
        self.assertEqual(response.status_code, 401)
        data = response.get_json()
        self.assertIn("message", data, "Message missing in response")
        self.assertEqual(data["message"], "Invalid username or password")

    def test_signin_missing_field(self):
        # Attempt to sign in with missing fields
        response = self.client.post("/users/signin", json={
            "username": "testuser",
        })
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn("error", data, "Validation errors not found")
        self.assertIn("password", data["error"], "Missing password validation not triggered")


if __name__ == "__main__":
    unittest.main()