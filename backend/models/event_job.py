from backend.db import db


class EventJob(db.Model):
    __tablename__ = 'event_job'

    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), primary_key=True)
    openings = db.Column(db.Integer, nullable=False)

    event = db.relationship("Event", back_populates="jobs")
    job = db.relationship("Job", back_populates="events")

    def add_job_to_event(self: int, job_id: int, openings: int) -> None:
        db.session.execute(EventJob.insert().values(event_id=self, job_id=job_id, openings=openings))
        db.session.commit()
