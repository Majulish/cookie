from typing import Union

from fastapi import APIRouter

router = APIRouter()


@router.get("/", tags=[""])
def read_root():
    return {"Hello": "World"}


@router.get("/user", tags=["user"])
def get_user(q: Union[str, None] = None):
    return {"name": q}


@router.post("/user")
def post_user(q: Union[str, None] = None):
    return {"name": q}
