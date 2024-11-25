import unittest
from backend.stores.user_store import UserStore
from backend.db import db
from backend.main import create_app
from backend.models.roles import Role
from datetime import datetime


class TestUserSignup(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        cls.client = cls.app.test_client()
        cls.app.config['TESTING'] = True
        db.create_all()

    @classmethod
    def tearDownClass(cls):
        db.session.remove()
        db.create_all()
        cls.app_context.pop()

    def setUp(self):
        self.user_data = {
            "username": "testuser",
            "password": "Password123!",
            "email": "testuser@example.com",
            "role": Role.WORKER,
            "first_name": "John",
            "family_name": "Doe",
            "birthdate": datetime(1990, 5, 15).isoformat(),
            "phone_number": "1234567890",
            "personal_id": "123456789",
            "company_id": "123",
            "company_name": "TestCompany",
        }

        # Clean up user before running tests
        UserStore.delete_user("username", self.user_data["username"])

    def tearDown(self):
        UserStore.delete_user("username", self.user_data["username"])

    def test_signup_successful(self):
        response = self.client.post("/users/signup", json=self.user_data)
        self.assertEqual(response.status_code, 201)
        self.assertIn("User registered successfully", response.get_json()["message"])

    def test_signup_existing_username(self):
        # First signup
        self.client.post("/users/signup", json=self.user_data)

        # Second signup with the same username
        response = self.client.post("/users/signup", json=self.user_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Username already exists", response.get_json()["message"])

    def test_signup_missing_field(self):
        invalid_data = self.user_data.copy()
        del invalid_data["email"]  # Remove required field

        response = self.client.post("/users/signup", json=invalid_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())

    def test_signup_invalid_email(self):
        invalid_data = self.user_data.copy()
        invalid_data["email"] = "invalid-email"

        response = self.client.post("/users/signup", json=invalid_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())


if __name__ == "__main__":
    unittest.main()
