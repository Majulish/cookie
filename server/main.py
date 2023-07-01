import uvicorn
from cookie.server.routers.routers import router
from fastapi import FastAPI

app = FastAPI()

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=27017)

