import unittest
from datetime import datetime, timedelta
import json
from enum import Enum

from backend.stores import UserStore, EventStore
from backend.db import db
from backend.main import create_app
from backend.models import EventStatus, Role, User


class EventTestCase(unittest.TestCase):
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
        # Set up a user with the WORKER role
        self.user_data = {
            'username': 'worker1',
            'password': 'Aa123456!',
            'email': 'worker1@example.com',
            'role': Role.WORKER,
            'first_name': 'Worker',
            'family_name': 'One',
            'personal_id': '1',
            'phone_number': '0501234567',
            'birthdate': '1990-01-01',
            'city': 'Worker City',
            'bank_number': '1234567890123456',
            'bank_branch_number': '123',
            'credit_card_account_number': '1234567890123456',
            'company_id': 1
        }
        EventStore.delete_worker_by_personal_id(self.user_data['personal_id'])
        UserStore.delete_user_by_username(self.user_data['username'])
        self.worker = UserStore.create_user(self.user_data)

        # Authenticate and get JWT token
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        login_response = self.client.post('/users/signin', json=login_data)
        login_data = login_response.get_json()
        self.jwt_token = login_data.get('access_token')

        self.event_data = {
            'id': 1,
            'name': 'Test Event',
            'start_time': datetime.now(),
            'end_time': datetime.now() + timedelta(hours=2),
            'description': 'An event for testing',
            'location': 'Test Location',
            'status': EventStatus.PLANNED,
            'advertised': False
        }

        EventStore.delete_event(self.event_data['id'])
        EventStore.create_event(self.event_data)

    def tearDown(self):
        EventStore.delete_worker(self.event_data['id'])
        EventStore.delete_event(self.event_data['id'])
        UserStore.delete_user_by_username(self.user_data['username'])

    def authenticate(self):
        signin_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }

        response = self.client.post('/users/signin', json=signin_data)
        self.assertEqual(200, response.status_code)
        return response.get_json()['access_token']

    def test_create_event(self):
        class CustomJSONEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, Enum):
                    return obj.value
                if isinstance(obj, datetime):
                    return obj.isoformat()
                return super().default(obj)

        # Convert self.event_data dictionary to a JSON-compatible dictionary
        request_body = json.loads(json.dumps(self.event_data, cls=CustomJSONEncoder))

        # Authenticate and get a token
        token = self.authenticate()

        # Include the token in the headers
        headers = {
            'Authorization': f'Bearer {token}'
        }

        # Send the POST request with the dictionary, not a JSON string
        response = self.client.post('/events/create_event', headers=headers, json=request_body)
        data = response.get_json()

        # Assertions
        self.assertEqual(201, response.status_code)
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'Event created successfully.')

    def test_update_event(self):
        updated_data = {
            'name': 'Updated Event',
            'description': 'Updated event description',
            'location': 'Updated Location'
        }

        headers = {
            'Authorization': f'Bearer {self.jwt_token}'
        }

        response = self.client.put(f'/events/{self.event_data["id"]}', json=updated_data, headers=headers)

        self.assertEqual(200, response.status_code)
        updated_event = EventStore.get_event_by_id(self.event_data['id'])
        self.assertEqual(updated_event.name, updated_data['name'])
        self.assertEqual(updated_event.description, updated_data['description'])
        self.assertEqual(updated_event.location, updated_data['location'])

    def test_delete_event(self):
        headers = {
            'Authorization': f'Bearer {self.jwt_token}'
        }

        response = self.client.delete(f'/events/{self.event_data["id"]}', headers=headers)

        self.assertEqual(200, response.status_code)
        deleted_event = EventStore.get_event_by_id(self.event_data['id'])
        self.assertIsNone(deleted_event)

    def test_add_worker_to_event(self):
        # Retrieve the worker from the database

        worker = User.find_by_username(username='worker1')
        headers = {
            'Authorization': f'Bearer {self.jwt_token}'
        }

        print('im trying to insert worker_id: ', worker.id)

        response = self.client.post(f'/events/{self.event_data["id"]}/workers', json={'worker_id': worker.id},
                                    headers=headers)

        self.assertEqual(200, response.status_code)
        event_with_worker = EventStore.get_workers_by_event(self.event_data['id'])
        self.assertEqual(len(event_with_worker), 1)
        self.assertEqual(event_with_worker[0]['personal_id'], str(worker.id))

    def test_add_job_to_event(self):
        self.jobs = {
            'id': 1,
            'name': 'chef'
        }
        headers = {
            'Authorization': f'Bearer {self.jwt_token}'
        }

        response = self.client.post(f'/events/{self.event_data["id"]}/jobs',
                                    json={'job_id': self.jobs['id'], 'name': self.jobs['name'], 'openings': 5},
                                    headers=headers)

        self.assertEqual(200, response.status_code)
