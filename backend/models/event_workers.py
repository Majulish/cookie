from backend import db


class EventWorkers(db.Model):
    __tablename__ = 'event_workers'

    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), primary_key=True)
    worker_id = db.Column(db.String, db.ForeignKey('users.personal_id'), primary_key=True)

    def add_worker(self, worker_id: int) -> None:
        try:
            db.session.execute(EventWorkers.insert().values(event_id=self.id, worker_id=worker_id))
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    # delete_worker function deletes all rows in the EventWorkers table where the event_id matches the provided event_id
    def delete_worker(event_id: int) -> None:
        try:
            EventWorkers.query.filter_by(event_id=event_id).delete()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e
