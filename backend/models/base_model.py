import datetime
from sqlalchemy.exc import SQLAlchemyError
from backend.db import db


class BaseModel:
    created_at = datetime.datetime.now(datetime.UTC)
    updated_at = datetime.datetime.now(datetime.UTC)

    def save(self, *args, **kwargs):
        try:
            self.updated_at = datetime.datetime.now(datetime.UTC)
            db.session.add(self)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e