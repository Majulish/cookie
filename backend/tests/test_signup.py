import unittest

from backend.stores import UserStore
from backend.db import db
from backend.main import create_app
from backend.models import Role


class UserSignupTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Set up the application and its context
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
        # Common user data used across tests
        self.user_data = {
            'username': 'testuser',
            'password': 'Password123!',
            'confirmPassword': 'Password123!',
            'email': 'testuser@example.com',
            'role': Role.WORKER.value,
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

        UserStore.delete_user_by_username(self.user_data['username'])

    def tearDown(self):
        UserStore.delete_user_by_username(self.user_data['username'])

    def test_signup_with_valid_info(self):
        response = self.client.post('/users/signup', json=self.user_data)
        data = response.get_json()
        self.assertEqual(201, response.status_code)
        self.assertIn('User registered successfully', data['message'])

    def test_signup_with_invalid_personal_id(self):
        invalid_data = self.user_data.copy()
        invalid_data['personal_id'] = '12345abc99'  # Invalid personal ID

        response = self.client.post('/users/signup', json=invalid_data)
        data = response.get_json()
        self.assertEqual(400, response.status_code)
        self.assertIn('id', data["error"])

    def test_signup_with_mismatched_passwords(self):
        mismatched_data = self.user_data.copy()
        mismatched_data['confirmPassword'] = 'Password123'  # Mismatched passwords

        response = self.client.post('/users/signup', json=mismatched_data)
        data = response.get_json()
        self.assertEqual(400, response.status_code)
        self.assertIn('Passwords do not match', data["error"])


if __name__ == '__main__':
    unittest.main()