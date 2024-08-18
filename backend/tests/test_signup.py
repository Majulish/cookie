import unittest
from flask import json, Response

from backend.main import create_app


class RoutesTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Set up the application and its context
        cls.app = create_app()
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        cls.client = cls.app.test_client()

    def setUp(self):
        # Ensure a clean start for each test by deleting specific test users
        with self.app.app_context():
            self.app.db.users.delete_many({"username": {"$in": ["testuser", "anotheruser"]}})

    def tearDown(self):
        # Clean up after each test by deleting specific test users
        with self.app.app_context():
            self.app.db.users.delete_many({"username": {"$in": ["testuser", "anotheruser"]}})

    def test_signup_with_valid_info(self) -> None:
        response: Response = self.client.post('/users/signup', data=json.dumps({
            'username': 'testuser',
            'password': 'Password123!',
            'email': 'testuser@example.com',
            'role': 'worker'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['message'], 'User registered successfully')

    def test_signup_with_duplicate_username(self) -> None:
        self.client.post('/users/signup', data=json.dumps({
            'username': 'testuser',
            'password': 'Password123!',
            'email': 'testuser@example.com',
            'role': 'worker'
        }), content_type='application/json')

        # Attempt to sign up with the same username again
        response: Response = self.client.post('/users/signup', data=json.dumps({
            'username': 'testuser',
            'password': 'AnotherPassword123!',
            'email': 'anotheruser@example.com',
            'role': 'worker'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['message'], 'Username already exists')

    def test_signup_with_invalid_info(self) -> None:
        # Test with empty username
        response: Response = self.client.post('/users/signup', data=json.dumps({
            'username': '',
            'password': 'Password123!',
            'email': 'testuser@example.com',
            'role': 'worker'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('username', [error['loc'][0] for error in data])

        # Test with short password
        response: Response = self.client.post('/users/signup', data=json.dumps({
            'username': 'testuser',
            'password': 'short',
            'email': 'testuser@example.com',
            'role': 'worker'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', [error['loc'][0] for error in data])

        # Test with invalid email
        response: Response = self.client.post('/users/signup', data=json.dumps({
            'username': 'testuser',
            'password': 'Password123!',
            'email': 'invalidemail',
            'role': 'worker'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', [error['loc'][0] for error in data])


if __name__ == '__main__':
    unittest.main()
