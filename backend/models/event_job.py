from sqlalchemy.exc import SQLAlchemyError

from backend.db import db


class EventJob(db.Model):
    __tablename__ = "event_jobs"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    job_title = db.Column(db.String(80), nullable=False)
    slots = db.Column(db.Integer, nullable=False)  # Total number of slots
    openings = db.Column(db.Integer, nullable=False)  # Remaining open positions

    @staticmethod
    def create_event_job(event_id: int, job_title: str, slots: int) -> "EventJob":
        """
        Creates a new job for an event in the database.
        """
        event_job = EventJob(
            event_id=event_id,
            job_title=job_title,
            slots=slots,
            openings=slots,
        )
        db.session.add(event_job)
        db.session.commit()
        return event_job

    def add_job_to_event(self: int, job_id: int, slots: int) -> None:
        try:
            db.session.execute(
                EventJob.__table__.insert().values(event_id=self, job_id=job_id, slots=slots, openings=slots)
            )
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    def save_to_db(self) -> None:
        db.session.add(self)
        db.session.commit()

    def reduce_openings(self) -> None:
        """
        Reduces the number of openings for the job by 1.
        Ensures that openings do not drop below zero.
        """
        if self.openings <= 0:
            raise ValueError(f"No openings available for job '{self.job_title}'.")
        try:
            self.openings -= 1
            self.save_to_db()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e
