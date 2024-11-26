from backend.db import db
from backend.models.user import User
from backend.models.event import Event
from backend.models.roles import Role
from backend.models.event_job import EventJob


def setup_example_data():
    # Create workers
    worker1 = User(
        username="worker1",
        email="worker1@example.com",
        password_hash="hashed_password1",  # Replace with a hashed password
        role=Role.WORKER,
        first_name="Worker",
        family_name="One",
        personal_id="111111111"
    )
    worker2 = User(
        username="worker2",
        email="worker2@example.com",
        password_hash="hashed_password2",  # Replace with a hashed password
        role=Role.WORKER,
        first_name="Worker",
        family_name="Two",
        personal_id="222222222"
    )

    # Create recruiters
    recruiter1 = User(
        username="recruiter1",
        email="recruiter1@example.com",
        password_hash="hashed_password3",  # Replace with a hashed password
        role=Role.RECRUITER,
        first_name="Recruiter",
        family_name="One",
        personal_id="333333333"
    )
    recruiter2 = User(
        username="recruiter2",
        email="recruiter2@example.com",
        password_hash="hashed_password4",  # Replace with a hashed password
        role=Role.RECRUITER,
        first_name="Recruiter",
        family_name="Two",
        personal_id="444444444"
    )

    # Create HR Manager
    hr_manager = User(
        username="hrmanager",
        email="hrmanager@example.com",
        password_hash="hashed_password5",  # Replace with a hashed password
        role=Role.HR_MANAGER,
        first_name="HR",
        family_name="Manager",
        personal_id="555555555"
    )

    # Add users to the database
    db.session.add_all([worker1, worker2, recruiter1, recruiter2, hr_manager])
    db.session.commit()

    # Create events for recruiters
    event1 = Event(
        name="Event by Recruiter 1",
        description="An event created by recruiter1.",
        location="Location A",
        start_time="2024-12-01T10:00:00",
        end_time="2024-12-01T14:00:00",
        recruiter="recruiter1",
        status="planned"
    )
    event2 = Event(
        name="Event by Recruiter 2",
        description="An event created by recruiter2.",
        location="Location B",
        start_time="2024-12-02T10:00:00",
        end_time="2024-12-02T14:00:00",
        recruiter="recruiter2",
        status="planned"
    )

    # Add events to the database
    db.session.add_all([event1, event2])
    db.session.commit()

    # Create event jobs for the events
    job1 = EventJob.create_event_job(event_id=event1.id, job_title="Cook", slots=5)
    job2 = EventJob.create_event_job(event_id=event2.id, job_title="Waiter", slots=3)

    print("Example data setup complete.")


if __name__ == "__main__":
    setup_example_data()
