from backend.db import db
import datetime

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    commenter_id = db.Column(db.Integer, nullable=False)
    review_text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.now(datetime.UTC))

    # Relationships
    worker = db.relationship("User", foreign_keys=[worker_id], back_populates="reviews_received")

    def __init__(self, worker_id, commenter_id, review_text):
        self.worker_id = worker_id
        self.commenter_id = commenter_id
        self.review_text = review_text

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_review_by_worker(cls, worker_id):
        return cls.query.filter_by(worker_id=worker_id).all()
