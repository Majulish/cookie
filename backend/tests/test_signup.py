# tests/test_signup.py

import unittest
from main import create_app
from flask import json


class RoutesTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()
        cls.app.config['TESTING'] = True

    def setUp(self):
        # Ensure a clean start for each test by deleting specific test users
        with self.app.app_context():
            self.app.db.users.delete_many({"username": {"$in": ["testuser", "anotheruser"]}})

    def tearDown(self):
        # Clean up after each test by deleting specific test users
        with self.app.app_context():
            self.app.db.users.delete_many({"username": {"$in": ["testuser", "anotheruser"]}})

    def test_signup_with_valid_info(self):
        response = self.client.post('/signup', data=json.dumps({
            'username': 'testuser',
            'password': 'Password123!',
            'email': 'testuser@example.com'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['message'], 'User registered successfully')

    def test_signup_with_duplicate_username(self):
        # First sign up with valid info
        self.client.post('/signup', data=json.dumps({
            'username': 'testuser',
            'password': 'Password123!',
            'email': 'testuser@example.com'
        }), content_type='application/json')

        # Attempt to sign up with the same username again
        response = self.client.post('/signup', data=json.dumps({
            'username': 'testuser',
            'password': 'AnotherPassword123!',
            'email': 'anotheruser@example.com'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['message'], 'Username already exists')

    def test_signup_with_invalid_info(self):
        response = self.client.post('/signup', data=json.dumps({
            'username': '',
            'password': 'short',
            'email': 'invalidemail'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)


if __name__ == '__main__':
    unittest.main()
