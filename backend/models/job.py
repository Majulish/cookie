from sqlalchemy.orm import relationship
from backend.db import db
from backend.models import EventJob


class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)

    events = relationship("Event", secondary=EventJob, back_populates="jobs")

    def create_job(self) -> None:
        db.session.add(self)
        db.session.commit()
