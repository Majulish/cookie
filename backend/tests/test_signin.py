import unittest

from backend.stores import UserStore
from backend.db import db
from backend.main import create_app
from backend.models import Role



class UserSigninTestCase(unittest.TestCase):
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
        db.drop_all()
        cls.app_context.pop()

    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'password': 'Password123!',
            'email': 'testuser@example.com',
            'role': Role.WORKER,
            'first_name': 'Test',
            'family_name': 'User',
            'personal_id': '123456789',
            'phone_number': '0501234567',
            'birthdate': '1990-01-01',
            'city': 'Test City',
            'bank_number': '1234567890123456',
            'bank_branch_number': '123',
            'credit_card_account_number': '1234567890123456',
            'company_id': 1
        }

        # Ensure the user is deleted before creating
        UserStore.delete_user_by_username(self.user_data['username'])
        UserStore.create_user(self.user_data)

    def tearDown(self):
        # Ensure the user is deleted after each test
        UserStore.delete_user_by_username(self.user_data['username'])

    def test_signin_with_valid_credentials(self):
        signin_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }

        response = self.client.post('/users/signin', json=signin_data)
        data = response.get_json()
        self.assertEqual(200, response.status_code)
        self.assertIn('access_token', data)

    def test_signin_with_invalid_password(self):
        signin_data = {
            'username': self.user_data['username'],
            'password': 'WrongPassword123'
        }

        response = self.client.post('/users/signin', json=signin_data)
        data = response.get_json()
        self.assertEqual(401, response.status_code)

    def test_signin_with_nonexistent_user(self):
        signin_data = {
            'username': 'nonexistentuser',
            'password': 'Password123!'
        }

        response = self.client.post('/users/signin', json=signin_data)
        data = response.get_json()
        self.assertEqual(401, response.status_code)


if __name__ == '__main__':
    unittest.main()
