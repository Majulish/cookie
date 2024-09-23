from backend.stores import UserStore
from backend.models import Role
from backend.db import db
from backend.main import create_app


def setup_users():
    app = create_app()
    with app.app_context():
        db.create_all()

        users = [
            {
                'username': 'worker1',
                'email': 'worker1@example.com',
                'password': 'Password123!',
                'role': Role.WORKER,
                'first_name': 'Worker',
                'family_name': 'One',
                'personal_id': '123456789',
                'phone_number': '0501234567',
                'birthdate': '1990-01-01',
                'city': 'CityA',
                'company_id': 1
            },
            {
                'username': 'worker2',
                'email': 'worker2@example.com',
                'password': 'Password123!',
                'role': Role.WORKER,
                'first_name': 'Worker',
                'family_name': 'Two',
                'personal_id': '987654321',
                'phone_number': '0509876543',
                'birthdate': '1992-02-02',
                'city': 'CityB',
                'company_id': 1
            },
            {
                'username': 'hrmanager',
                'email': 'hrmanager@example.com',
                'password': 'Password123!',
                'role': Role.HR_MANAGER,
                'first_name': 'HR',
                'family_name': 'Manager',
                'personal_id': '192837465',
                'phone_number': '0512345678',
                'birthdate': '1985-03-03',
                'city': 'CityC',
                'company_id': 2
            },
            {
                'username': 'recruiter',
                'email': 'recruiter@example.com',
                'password': 'Password123!',
                'role': Role.RECRUITER,
                'first_name': 'Recruiter',
                'family_name': 'One',
                'personal_id': '111222333',
                'phone_number': '0523456789',
                'birthdate': '1988-04-04',
                'city': 'CityD',
                'company_id': 2
            }
        ]

        for user_data in users:
            existing_personal_id = UserStore.find_user_by_id(user_data['personal_id'])
            if not existing_personal_id:
                UserStore.create_user(user_data)


if __name__ == '__main__':
    setup_users()
