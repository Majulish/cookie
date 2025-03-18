from typing import Optional

from backend.db import db
import datetime

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    commenter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    review_text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC))
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)

    # Relationships
    worker = db.relationship("User", foreign_keys=[worker_id])
    commenter = db.relationship("User", foreign_keys=[commenter_id])
    event = db.relationship("Event", foreign_keys=[event_id])

    def __init__(self, worker_id, commenter_id, review_text, event_id):
        self.worker_id = worker_id
        self.commenter_id = commenter_id
        self.review_text = review_text
        self.event_id = event_id

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by(cls, filters: dict):
        try:
            return cls.query.filter_by(**filters).all()
        except Exception as e:
            db.session.rollback()
            print(e)
            raise e

    @classmethod
    def add_review(cls, worker_id: int, commenter_id: int, review_text: str, event_id:int) -> None:
        """
        Adds a review for the worker and saves it in the database.
        """
        review = Review(worker_id=worker_id, commenter_id=commenter_id, review_text=review_text, event_id = event_id)
        db.session.add(review)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e




