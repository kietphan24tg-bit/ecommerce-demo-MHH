from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import get_settings
from db.base import Base

settings = get_settings()
engine = create_engine(
    settings.database_url,
    # Validate pooled connections before using them. This helps with
    # managed Postgres providers that may close idle SSL connections.
    pool_pre_ping=True,
    # Recycle connections periodically to reduce stale pooled sessions.
    pool_recycle=300,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
