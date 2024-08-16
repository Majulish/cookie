from enum import Enum


class Role(Enum):
    WORKER = "worker"
    MANAGER = "manager"
    RECRUITER = "recruiter"
    ADMIN = "admin"
