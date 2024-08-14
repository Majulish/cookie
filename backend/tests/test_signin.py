import unittest
from backend.main import create_app
from flask import json, Response


class SignInTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()
        cls.app.config['TESTING'] = True

    def setUp(self):
        # Ensure a clean start for each test by deleting specific test users
        with self.app.app_context():
            self.app.db.users.delete_many({"username": {"$in": ["testuser", "anotheruser"]}})

        # Create a test user to use in sign-in tests
        self.client.post('/signup', data=json.dumps({
            'username': 'testuser',
            'password': 'Password123!',
            'email': 'testuser@example.com',
            'role': 'worker'
        }), content_type='application/json')

    def tearDown(self):
        # Clean up after each test by deleting specific test users
        with self.app.app_context():
            self.app.db.users.delete_many({"username": {"$in": ["testuser", "anotheruser"]}})

    def test_signin_with_valid_info(self) -> None:
        response: Response = self.client.post('/login', data=json.dumps({
            'username': 'testuser',
            'password': 'Password123!'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', data)

        token_data = json.loads(json.dumps(data['access_token']))
        self.assertEqual(token_data['identity']['role'], 'worker')

    def test_signin_with_invalid_username(self) -> None:
        response: Response = self.client.post('/login', data=json.dumps({
            'username': 'wronguser',
            'password': 'Password123!'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(data['message'], 'Invalid username or password')

    def test_signin_with_invalid_password(self) -> None:
        response: Response = self.client.post('/login', data=json.dumps({
            'username': 'testuser',
            'password': 'WrongPassword!'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(data['message'], 'Invalid username or password')

    def test_signin_with_missing_credentials(self) -> None:
        # Test with missing username
        response: Response = self.client.post('/login', data=json.dumps({
            'password': 'Password123!'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('missing', str(data[0]))

        # Test with missing password
        response: Response = self.client.post('/login', data=json.dumps({
            'username': 'testuser'
        }), content_type='application/json')

        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('missing', str(data[0]))
