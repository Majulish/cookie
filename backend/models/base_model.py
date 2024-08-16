from datetime import datetime


class BaseModel:
    created_at = datetime.now()
    updated_at = datetime.now()

    def save(self, *args, **kwargs):
        self.updated_at = datetime.now()
