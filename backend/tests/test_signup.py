import unittest
from flask import json, Response

from backend.main import create_app
import unittest
from backend.main import create_app, db
from backend.stores.user_store import UserStore


class UserSignupTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app_context = cls.app.app_context()
        cls.app_context.push()
        cls.client = cls.app.test_client()
        cls.app.config['TESTING'] = True

        # Create all tables
        db.create_all()

        # Set up the store
        cls.user_store = UserStore()

    @classmethod
    def tearDownClass(cls):
        # Drop all tables after tests
        db.session.remove()
        db.drop_all()
        cls.app_context.pop()

    def setUp(self):
        # Optionally clear the user table before each test
        pass

    def test_signup_with_valid_info(self):
        response = self.client.post('/users/signup', json={
            'username': 'testuser',
            'password': 'Password123!',
            'email': 'testuser@example.com'
        })
        data = response.get_json()
        self.assertEqual(response.status_code, 201)
        self.assertIn('User registered successfully', data['message'])

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
