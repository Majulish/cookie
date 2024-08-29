import unittest
from datetime import datetime, timedelta

from backend.stores import UserStore, EventStore
from backend.db import db
from backend.main import create_app
from backend.models import EventStatus, Role


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
            'password_hash': 'hashed_password',  # Mock hashed password
            'email': 'worker1@example.com',
            'role': Role.WORKER.value,  # Use the enum value
            'first_name': 'Worker',
            'family_name': 'One',
            'personal_id': '987654321',
            'phone_number': '0501234567',
            'birthdate': '1990-01-01',
            'city': 'Worker City',
            'bank_number': '1234567890123456',
            'bank_branch_number': '123',
            'credit_card_account_number': '1234567890123456',
            'company_id': 1
        }
        UserStore.delete_user_by_username(self.user_data['username'])
        self.worker = UserStore.create_user(self.user_data)

        # Set up event data
        self.event_data = {
            'name': 'Test Event',
            'start_time': datetime.now(),
            'end_time': datetime.now() + timedelta(hours=2),
            'description': 'An event for testing',
            'location': 'Test Location',
            'status': EventStatus.PLANNED,
            'advertised': False
        }

        EventStore.delete_event(self.event_data['name'])
        self.event = EventStore.create_event(**self.event_data)

    def tearDown(self):
        EventStore.delete_event(self.event_data['name'])
        UserStore.delete_user_by_username(self.user_data['username'])

    def test_create_event(self):
        response = self.client.post('/events', json=self.event_data)
        data = response.get_json()
        self.assertEqual(201, response.status_code)
        self.assertIn('id', data)

    def test_update_event(self):
        updated_data = {
            'name': 'Updated Event',
            'description': 'Updated event description',
            'location': 'Updated Location'
        }
        response = self.client.put(f'/events/{self.event.id}', json=updated_data)
        self.assertEqual(200, response.status_code)
        updated_event = EventStore.get_event_by_id(self.event.id)
        self.assertEqual(updated_event.name, updated_data['name'])
        self.assertEqual(updated_event.description, updated_data['description'])
        self.assertEqual(updated_event.location, updated_data['location'])

    def test_delete_event(self):
        response = self.client.delete(f'/events/{self.event.id}')
        self.assertEqual(200, response.status_code)
        deleted_event = EventStore.get_event_by_id(self.event.id)
        self.assertIsNone(deleted_event)

    def test_add_worker_to_event(self):
        response = self.client.post(f'/events/{self.event.id}/workers', json={'worker_id': self.worker.id})
        self.assertEqual(200, response.status_code)
        event_with_worker = EventStore.get_event_by_id(self.event.id)
        self.assertEqual(len(event_with_worker.users), 1)
        self.assertEqual(event_with_worker.users[0].id, self.worker.id)

    def test_add_job_to_event(self):
        # Assuming you have a way to mock or create jobs in your setup
        job_id = 1  # Mock job ID
        response = self.client.post(f'/events/{self.event.id}/jobs', json={'job_id': job_id, 'openings': 5})
        self.assertEqual(200, response.status_code)
        event_with_job = EventStore.get_event_by_id(self.event.id)
        self.assertIn(job_id, event_with_job.get_job_ids())
