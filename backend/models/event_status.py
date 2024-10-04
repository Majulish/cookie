from enum import Enum as PyEnum


class EventStatus(PyEnum):
    PLANNED = 'planned'
    STARTED = 'started'
    FINISHED = 'finished'
