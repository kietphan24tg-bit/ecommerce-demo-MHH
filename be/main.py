from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine
from core.config import settings

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup() -> None:
    # Importing models above ensures SQLAlchemy sees the tables before create_all.
    Base.metadata.create_all(bind=engine)
@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Fast api is running"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=4000, reload=True)
