import logging

from sqlalchemy import text

from db.database import engine

logger = logging.getLogger(__name__)


def verify_database_connectivity() -> None:
    """Ping the database without creating or altering schema."""
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    logger.info("Database connectivity verified")
